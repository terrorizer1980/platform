import { Inject, Injectable } from "@angular/core";
import {
  BehaviorSubject,
  combineLatest,
  forkJoin,
  from,
  interval,
  Observable,
  of,
  timer
} from "rxjs";
import { HttpClient } from "@angular/common/http";
import BigNumber from "bignumber.js";
import { first, map, skipWhile, switchMap } from "rxjs/operators";
import { CosmosAccount, CosmosBroadcastResult } from "@trustwallet/rpc";
import { CosmosDelegation } from "@trustwallet/rpc/src/cosmos/models/CosmosDelegation";
import { BlockatlasValidator } from "@trustwallet/rpc/src/blockatlas/models/BlockatlasValidator";
import { CosmosConfigService } from "./cosmos-config.service";
import { CosmosProviderConfig } from "../cosmos.descriptor";
import { CoinService } from "../../../services/coin.service";
import {
  StakeAction,
  StakeHolderList,
  TX_WAIT_CHECK_INTERVAL
} from "../../../coin-provider-config";
import { ExchangeRateService } from "../../../../shared/services/exchange-rate.service";
import { CoinType } from "@trustwallet/types";
import { CosmosRpcService } from "./cosmos-rpc.service";
import { CosmosUnboundInfoService } from "./cosmos-unbound-info.service";
import { CosmosStakingInfo } from "@trustwallet/rpc/lib/cosmos/models/CosmosStakingInfo";
import { AuthService } from "../../../../auth/services/auth.service";
import { CosmosTx } from "@trustwallet/rpc/lib/cosmos/models/CosmosTx";
import { ProviderUtils } from "../../provider-utils";
import { CosmosUtils } from "@trustwallet/rpc/lib";
import { CosmosUnbond } from "@trustwallet/rpc/lib/cosmos/models/CosmosUnbond";
import { CoinAtlasService } from "../../../services/atlas/coin-atlas.service";

// Used for creating Cosmos service manually bypassing regular routing flow
export const CosmosServiceInjectable = [
  CosmosConfigService,
  HttpClient,
  AuthService,
  ExchangeRateService,
  CosmosRpcService,
  CosmosUnboundInfoService,
  CoinAtlasService,
  ProviderUtils
];

@Injectable()
export class CosmosService implements CoinService {
  private readonly balance$: Observable<BigNumber>;
  private readonly stakedAmount$: Observable<BigNumber>;

  constructor(
    @Inject(CosmosConfigService)
    private config: Observable<CosmosProviderConfig>,
    private http: HttpClient,
    private authService: AuthService,
    private exchangeRateService: ExchangeRateService,
    private cosmosRpc: CosmosRpcService,
    private cosmosUnboundInfoService: CosmosUnboundInfoService,
    private atlasService: CoinAtlasService,
    private providerUtils: ProviderUtils
  ) {
    this.cosmosRpc.setConfig(config);

    this.balance$ = this.providerUtils.updatableBalance(
      this.getAddress.bind(this),
      this.requestBalance.bind(this),
      this.config
    );

    this.stakedAmount$ = this.providerUtils.updatableStakedAmount(
      this.getAddress.bind(this),
      this.requestStakedAmount.bind(this),
      this.config
    );
  }

  private requestBalance(address: string): Observable<BigNumber> {
    return this.getAccountOnce(address).pipe(
      map((account: CosmosAccount) => {
        const balances = (account as CosmosAccount).coins;

        const result = balances.find(
          coin => coin.denom.toUpperCase() === "UATOM"
        );
        return result.amount;
      })
    );
  }

  private requestStakedAmount(address: string): Observable<BigNumber> {
    return this.getAddressDelegations(address).pipe(
      map((delegations: CosmosDelegation[]) => {
        const shares =
          (delegations && delegations.map((d: CosmosDelegation) => d.shares)) ||
          [];
        return shares && shares.length
          ? BigNumber.sum(...shares)
          : new BigNumber(0);
      })
    );
  }

  private getTxPayload(
    addressFrom: string,
    addressTo: string,
    amount: BigNumber | null = null
  ): any {
    return this.config.pipe(
      map(cfg => {
        const cosmosAmount =
          amount != null
            ? {
                amount: {
                  denom: "uatom",
                  amount: amount.toFixed()
                }
              }
            : {};

        return {
          delegatorAddress: addressFrom,
          validatorAddress: addressTo,
          ...cosmosAmount
        };
      })
    );
  }

  private getCosmosTxSkeleton(account: CosmosAccount): Observable<any> {
    return this.config.pipe(
      switchMap(config =>
        combineLatest([config.chainId(this.http, config.endpoint), of(config)])
      ),
      map(([chain, config]) => ({
        typePrefix: "cosmos-sdk/StdTx",
        accountNumber: account.accountNumber,
        sequence: account.sequence,
        chainId: chain,
        fee: {
          amounts: [
            {
              denom: "uatom",
              amount: new BigNumber(config.fee).toFixed()
            }
          ],
          gas: config.gas.toFixed()
        }
      }))
    );
  }

  getAddressDelegations(address: string): Observable<CosmosDelegation[]> {
    return this.cosmosRpc.rpc.pipe(
      switchMap(rpc => from(rpc.listDelegations(address)))
    );
  }

  private getAccountOnce(address: string): Observable<CosmosAccount> {
    return this.cosmosRpc.rpc.pipe(
      switchMap(rpc => from(rpc.getAccount(address)))
    );
  }

  getAnnualPercent(): Observable<number> {
    return this.getValidators().pipe(
      map(validators =>
        this.providerUtils.selectValidatorWithBestInterestRate(validators)
      )
    );
  }

  getBalanceUSD(): Observable<BigNumber> {
    return this.balance$.pipe(
      switchMap(balance => forkJoin([of(balance), this.getPriceUSD()])),
      map(([balance, price]) => balance.multipliedBy(price))
    );
  }

  getBalanceCoins(): Observable<BigNumber> {
    return this.balance$;
  }

  getBalanceUnits(): Observable<BigNumber> {
    return this.balance$.pipe(map(balance => CosmosUtils.fromAtom(balance)));
  }

  getStakedUSD(): Observable<BigNumber> {
    return this.stakedAmount$.pipe(
      switchMap(balance => forkJoin([of(balance), this.getPriceUSD()])),
      map(([balance, price]) => balance.multipliedBy(price))
    );
  }

  getStaked(): Observable<BigNumber> {
    return this.stakedAmount$;
  }

  getStakeHolders(): Observable<StakeHolderList> {
    return this.providerUtils.address2StakeMap<CosmosDelegation>(
      this.config,
      this.getValidators.bind(this),
      this.getAddressDelegations.bind(this),
      delegation => delegation.validatorAddress,
      delegation => delegation.shares
    );
  }

  getPriceUSD(): Observable<BigNumber> {
    return this.config.pipe(
      switchMap(config => this.exchangeRateService.getRate(config.coin))
    );
  }

  getAddress(): Observable<string> {
    return this.config.pipe(
      switchMap(config =>
        this.authService.getAddressFromAuthorized(config.coin)
      )
    );
  }

  private stake(
    to: string,
    amount: BigNumber
  ): Observable<CosmosBroadcastResult> {
    return this.getAddress().pipe(
      switchMap(address => this.getAccountOnce(address)),
      switchMap(account =>
        combineLatest([
          this.getTxPayload(account.address, to, amount),
          this.getCosmosTxSkeleton(account)
        ])
      ),
      map(([payload, txSkeleton]) => ({
        ...txSkeleton,
        ["stakeMessage"]: {
          ...payload
        }
      })),
      switchMap(tx => this.authService.signTransaction(CoinType.cosmos, tx)),
      switchMap(tx => this.broadcastTx(tx))
    );
  }

  public unstake(
    to: string,
    amount: BigNumber
  ): Observable<CosmosBroadcastResult> {
    return this.getAddress().pipe(
      switchMap(address => this.getAccountOnce(address)),
      switchMap(account =>
        combineLatest([
          this.getTxPayload(account.address, to, amount),
          this.getCosmosTxSkeleton(account)
        ])
      ),
      map(([payload, txSkeleton]) => ({
        ...txSkeleton,
        ["unstakeMessage"]: {
          ...payload
        }
      })),
      switchMap(tx => this.authService.signTransaction(CoinType.cosmos, tx)),
      switchMap(tx => this.broadcastTx(tx))
    );
  }

  public withdraw(to: string): Observable<CosmosBroadcastResult> {
    return this.getAddress().pipe(
      switchMap(address => this.getAccountOnce(address)),
      switchMap(account =>
        combineLatest([
          this.getTxPayload(account.address, to),
          this.getCosmosTxSkeleton(account)
        ])
      ),
      map(([payload, txSkeleton]) => ({
        ...txSkeleton,
        ["withdrawStakeRewardMessage"]: {
          ...payload
        }
      })),
      switchMap(tx => this.authService.signTransaction(CoinType.cosmos, tx)),
      switchMap(tx => {
        const txJson = JSON.parse(tx);
        txJson.mode = "block";
        return this.broadcastTx(JSON.stringify(txJson));
      })
    );
  }

  getStakePendingBalance(): Observable<BigNumber> {
    return this.cosmosUnboundInfoService.getPendingBalance();
  }

  getStakePendingUnbonds(): Observable<CosmosUnbond[]> {
    return this.cosmosUnboundInfoService.getUnbonds();
  }

  getStakingRewards(): Observable<BigNumber> {
    return this.cosmosUnboundInfoService.getRewards();
  }

  getUnstakingDate(): Observable<Date> {
    return this.cosmosUnboundInfoService.getReleaseDate();
  }

  getStakingInfo(): Observable<CosmosStakingInfo> {
    return this.cosmosUnboundInfoService.getStakingInfo();
  }

  broadcastTx(tx: string): Observable<CosmosBroadcastResult> {
    return this.cosmosRpc.rpc.pipe(
      switchMap(rpc => {
        console.log("broadcast tx");
        return from(rpc.broadcastTransaction(tx));
      })
    );
  }

  prepareStakeTx(
    action: StakeAction,
    addressTo: string,
    amount: BigNumber
  ): Observable<CosmosTx> {
    if (action === StakeAction.STAKE) {
      return this.stake(addressTo, amount).pipe(
        switchMap(result => this.waitForTx(result.txhash))
      );
    } else {
      return this.withdraw(addressTo).pipe(
        switchMap(_ => this.unstake(addressTo, amount)),
        switchMap(result => this.waitForTx(result.txhash))
      );
    }
  }

  getStakedToValidator(validator: string): Observable<BigNumber> {
    return this.getStakeHolders().pipe(
      map(stakeholders => {
        const validatorStaked = stakeholders.find(
          holder => holder.id === validator
        );
        if (validatorStaked) {
          return validatorStaked.amount;
        }
        return new BigNumber(0);
      }),
      first()
    );
  }

  getValidators(): Observable<BlockatlasValidator[]> {
    return this.atlasService.getValidatorsFromBlockatlas(CoinType.cosmos);
  }

  getValidatorsById(validatorId: string): Observable<BlockatlasValidator> {
    return this.atlasService.getValidatorFromBlockatlasById(
      CoinType.cosmos,
      validatorId
    );
  }

  hasProvider(): Observable<boolean> {
    return this.authService.hasProvider(CoinType.cosmos);
  }

  isUnstakeEnabled(): Observable<boolean> {
    return of(true);
  }

  waitForTx(txhash: string): Observable<CosmosTx> {
    console.log(`waiting for tx ${txhash}`);
    return interval(TX_WAIT_CHECK_INTERVAL).pipe(
      switchMap(() => this.getStakingTransactions()),
      map(txs => txs.find(tx => tx.txhash === txhash)),
      skipWhile(tx => !tx),
      first()
    );
  }

  getStakingTransactions(): Observable<CosmosTx[]> {
    return combineLatest([this.cosmosRpc.rpc, this.getAddress()]).pipe(
      switchMap(([rpc, address]) => rpc.listDelegationsTransactions(address))
    );
  }
}

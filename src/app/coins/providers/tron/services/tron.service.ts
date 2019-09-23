import { Inject, Injectable } from "@angular/core";
import {
  BehaviorSubject,
  combineLatest,
  forkJoin,
  from,
  Observable,
  of,
  timer
} from "rxjs";
import { HttpClient } from "@angular/common/http";
import BigNumber from "bignumber.js";
import { first, map, switchMap } from "rxjs/operators";
import { BlockatlasValidator } from "@trustwallet/rpc/src/blockatlas/models/BlockatlasValidator";
import { CoinService } from "../../../services/coin.service";
import {
  BALANCE_REFRESH_INTERVAL,
  STAKE_REFRESH_INTERVAL,
  StakeAction,
  StakeHolderList
} from "../../../coin-provider-config";
import { ExchangeRateService } from "../../../../shared/services/exchange-rate.service";
import { CoinType } from "@trustwallet/types";
import { TrustProvider } from "@trustwallet/provider/lib";
import { CoinAtlasService } from "../../../services/coin-atlas.service";
import { TronConfigService } from "./tron-config.service";
import { TronProviderConfig } from "../tron.descriptor";
import { TronRpcService } from "./tron-rpc.service";
import { TronUnboundInfoService } from "./tron-unbound-info.service";
import {
  TronAccount,
  TronBroadcastResult,
  TronStakingInfo,
  TronUtils,
  TronVote
} from "@trustwallet/rpc/lib";
import { AuthService } from "../../../../auth/services/auth.service";

export const TronServiceInjectable = [
  TronConfigService,
  HttpClient,
  AuthService,
  ExchangeRateService,
  TronRpcService,
  TronUnboundInfoService,
  CoinAtlasService
];

interface IAggregatedDelegationMap {
  [address: string]: BigNumber;
}

@Injectable()
export class TronService implements CoinService {
  private _manualRefresh: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private readonly balance$: Observable<BigNumber>;
  private readonly stakedAmount$: Observable<BigNumber>;

  constructor(
    @Inject(TronConfigService)
    private config: Observable<TronProviderConfig>,
    private http: HttpClient,
    private authService: AuthService,
    private exchangeRateService: ExchangeRateService,
    private tronRpc: TronRpcService,
    private tronUnboundInfoService: TronUnboundInfoService,
    private atlasService: CoinAtlasService
  ) {
    this.tronRpc.setConfig(config);
    // Fires on address change or manual refresh
    const buildPipeline = (milliSeconds): Observable<string> =>
      combineLatest([this.getAddress(), this._manualRefresh]).pipe(
        switchMap((x: any[]) => {
          const [address, skip] = x;
          return timer(0, milliSeconds).pipe(map(() => address));
        })
      );

    this.balance$ = buildPipeline(BALANCE_REFRESH_INTERVAL).pipe(
      switchMap(address => {
        return this.requestBalance(address);
      })
    );

    this.stakedAmount$ = buildPipeline(STAKE_REFRESH_INTERVAL).pipe(
      switchMap(address => {
        return this.requestStakedAmount(address);
      }),
      map(amount => amount || new BigNumber(0))
    );
  }

  private requestBalance(address: string): Observable<BigNumber> {
    return this.getAccountOnce(address).pipe(
      map((account: TronAccount) => {
        return account.balance;
      })
    );
  }

  private requestStakedAmount(address: string): Observable<BigNumber> {
    return this.getAddressDelegations(address).pipe(
      map((delegations: TronVote[]) => {
        return delegations && delegations.length
          ? BigNumber.sum(...delegations.map(vote => vote.voteCount))
          : new BigNumber(0);
      })
    );
  }

  private map2List(
    config: TronProviderConfig,
    address2stake: IAggregatedDelegationMap,
    validators: Array<BlockatlasValidator>
  ): StakeHolderList {
    return Object.keys(address2stake).map(address => {
      const validator = validators.find(v => v.id === address);
      return {
        ...validator,
        amount: TronUtils.toTron(address2stake[address]),
        coin: config
      };
    });
  }

  private validatorsAndDelegations(): any[] {
    return [
      this.getValidators(),
      this.authService
        .getAddressFromAuthorized(CoinType.tron)
        .pipe(switchMap(address => this.getAddressDelegations(address)))
    ];
  }

  private address2StakeMap(): Observable<StakeHolderList> {
    return combineLatest([
      ...this.validatorsAndDelegations(),
      this.config
    ]).pipe(
      map((data: any[]) => {
        const approvedValidators: BlockatlasValidator[] = data[0];
        const myDelegations: TronVote[] = data[1];
        const config: TronProviderConfig = data[2];

        // TODO: double check most probably we no need that check
        if (!approvedValidators || !myDelegations) {
          return [];
        }

        const addresses = approvedValidators.map(d => d.id);

        // Ignore delegations to validators that isn't in a list of approved validators
        const filteredDelegations = myDelegations.filter(
          (delegation: TronVote) => {
            // TODO: use map(Object) in case we have more that 10 approved validators
            return addresses.includes(delegation.voteAddress);
          }
        );

        const address2stakeMap = filteredDelegations.reduce(
          (acc: IAggregatedDelegationMap, delegation: TronVote) => {
            // TODO: Use BN or native browser BigInt() + polyfill
            const aggregatedAmount =
              acc[delegation.voteAddress] || new BigNumber(0);
            const sharesAmount = +delegation.voteCount || new BigNumber(0);
            acc[delegation.voteAddress] = aggregatedAmount.plus(sharesAmount);
            return acc;
          },
          {}
        );

        return this.map2List(config, address2stakeMap, approvedValidators);
      }),
      first()
    );
  }

  private selectValidatorWithBestInterestRate(
    validators: BlockatlasValidator[]
  ) {
    return validators.reduce(
      (maxRate: number, validator: BlockatlasValidator) => {
        return maxRate < validator.reward.annual
          ? validator.reward.annual
          : maxRate;
      },
      0
    );
  }

  private getTxPayload(
    addressFrom: string,
    addressTo: string,
    amount: BigNumber
  ): any {
    return this.config.pipe(
      map(cfg => ({
        delegatorAddress: addressFrom,
        validatorAddress: addressTo,
        amount: {
          denom: "uatom",
          amount: amount.toFixed()
        }
      }))
    );
  }

  private getTxSkeleton(account: TronAccount): Observable<any> {
    return this.config.pipe(
      switchMap(config =>
        combineLatest([config.chainId(this.http, config.endpoint), of(config)])
      ),
      map(([chain, config]) => ({
        typePrefix: "auth/StdTx"
      }))
    );
  }

  getAddressDelegations(address: string): Observable<TronVote[]> {
    return this.tronRpc.rpc.pipe(
      switchMap(rpc => from(rpc.listDelegations(address)))
    );
  }

  private getAccountOnce(address: string): Observable<TronAccount> {
    return this.tronRpc.rpc.pipe(
      switchMap(rpc => from(rpc.getAccount(address)))
    );
  }

  getAnnualPercent(): Observable<number> {
    return this.getValidators().pipe(
      map(validators => this.selectValidatorWithBestInterestRate(validators))
    );
  }
  getBalanceUSD(): Observable<BigNumber> {
    return this.balance$.pipe(
      switchMap(balance => forkJoin([of(balance), this.getPriceUSD()])),
      map(([balance, price]) => balance.multipliedBy(price))
    );
  }
  getBalance(): Observable<BigNumber> {
    return this.balance$;
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
    return this.address2StakeMap();
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
    account: TronAccount,
    to: string,
    amount: BigNumber
  ): Observable<string> {
    return combineLatest([
      this.getTxPayload(account.address, to, amount),
      this.getTxSkeleton(account)
    ]).pipe(
      map(([payload, txSkeleton]) => ({
        ...txSkeleton,
        ["stakeMessage"]: {
          ...payload
        }
      })),
      switchMap(tx => from(this.authService.signTransaction(CoinType.tron, tx)))
    );
  }

  private unstake(
    account: TronAccount,
    to: string,
    amount: BigNumber
  ): Observable<string> {
    return combineLatest([
      this.getTxPayload(account.address, to, amount),
      this.getTxSkeleton(account)
    ]).pipe(
      map(([payload, txSkeleton]) => ({
        ...txSkeleton,
        ["unstakeMessage"]: {
          ...payload
        }
      })),
      switchMap(tx => from(this.authService.signTransaction(CoinType.tron, tx)))
    );
  }

  getStakePendingBalance(): Observable<BigNumber> {
    return this.tronUnboundInfoService.getPendingBalance();
  }

  getStakingRewards(): Observable<BigNumber> {
    return this.tronUnboundInfoService.getRewards();
  }

  getUnstakingDate(): Observable<Date> {
    return this.tronUnboundInfoService.getReleaseDate();
  }

  getStakingInfo(): Observable<TronStakingInfo> {
    return this.tronUnboundInfoService.getStakingInfo();
  }

  broadcastTx(tx: string): Observable<TronBroadcastResult> {
    return this.tronRpc.rpc.pipe(
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
  ): Observable<TronBroadcastResult> {
    return this.getAddress().pipe(
      switchMap(address => {
        return this.getAccountOnce(address);
      }),
      switchMap((account: TronAccount) => {
        if (action === StakeAction.STAKE) {
          return this.stake(account, addressTo, amount);
        } else {
          return this.unstake(account, addressTo, amount);
        }
      }),
      switchMap(result => {
        return this.broadcastTx(result);
      })
    );
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
    return this.atlasService.getValidatorsFromBlockatlas(CoinType.tron);
  }
  getValidatorsById(validatorId: string): Observable<BlockatlasValidator> {
    return this.atlasService.getValidatorFromBlockatlasById(
      CoinType.tron,
      validatorId
    );
  }

  hasProvider(): Observable<boolean> {
    return this.authService.hasProvider(CoinType.tron);
  }
}

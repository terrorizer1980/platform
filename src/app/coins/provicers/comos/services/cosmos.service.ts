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
import { CosmosAccount, CosmosRPC } from "@trustwallet/rpc";
import BigNumber from "bignumber.js";
import { first, map, switchMap } from "rxjs/operators";
import {
  BlockatlasRPC,
  BlockatlasValidatorResult,
  CosmosBroadcastResult
} from "@trustwallet/rpc/lib";
import { CosmosDelegation } from "@trustwallet/rpc/src/cosmos/models/CosmosDelegation";
import { AccountService } from "../../../../core/services/account.service";
import { BlockatlasValidator } from "@trustwallet/rpc/src/blockatlas/models/BlockatlasValidator";
import { environment } from "../../../../../environments/environment";
import { CosmosConfigService } from "./cosmos-config.service";
import { CosmosProviderConfig } from "../cosmos.descriptor";
import { CoinService } from "../../../services/coin.service";
import { StakeHolderList } from "../../../coin-provider-config";
import { ExchangeRateService } from "../../../../shared/services/exchange-rate.service";

const BALANCE_REFRESH_INTERVAL = 60000;
const STAKE_REFRESH_INTERVAL = 115000;

// Used for creating Cosmos service manually bypassing regular routing flow
export const CosmosServiceInjectable = [
  CosmosConfigService,
  HttpClient,
  AccountService,
  ExchangeRateService
];

interface IAggregatedDelegationMap {
  // TODO: Use BN or native browser BigInt() + polyfill
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-2.html
  [address: string]: BigNumber;
}

@Injectable({
  providedIn: "root"
})
export class CosmosService implements CoinService {
  private _manualRefresh: BehaviorSubject<boolean> = new BehaviorSubject(true);

  balance$: Observable<BigNumber>;
  stakedAmount$: Observable<BigNumber>;

  constructor(
    @Inject(CosmosConfigService)
    private config: Observable<CosmosProviderConfig>,
    private http: HttpClient,
    private accountService: AccountService,
    private exchangeRateService: ExchangeRateService
  ) {
    // Fires on address change or manual refresh
    const buildPipeline = (milliSeconds): Observable<string> =>
      combineLatest([accountService.address$, this._manualRefresh]).pipe(
        switchMap((x: any[]) => {
          const [address, skip] = x;
          return timer(0, milliSeconds).pipe(map(() => address));
        })
      );

    this.balance$ = buildPipeline(BALANCE_REFRESH_INTERVAL).pipe(
      switchMap(address => {
        return this.requestBalance(address);
      }),
      map(uAtom => this.toAtom(uAtom))
    );

    this.stakedAmount$ = buildPipeline(STAKE_REFRESH_INTERVAL).pipe(
      switchMap(address => {
        return this.requestStakedAmount(address);
      }),
      map(uAtom => this.toAtom(uAtom) || new BigNumber(0))
    );
  }

  refresh() {
    this._manualRefresh.next(true);
  }

  private requestBalance(address: string): Observable<BigNumber> {
    return this.getAccountOnce$(address).pipe(
      map((account: CosmosAccount) => {
        // TODO: add type annotation once it exported by library (Coin)
        const balances = (account as CosmosAccount).coins;

        // TODO: check, probably with library toUpperCase is no needed here
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
        return BigNumber.sum(...shares);
      })
    );
  }

  private map2List(
    config: CosmosProviderConfig,
    address2stake: IAggregatedDelegationMap,
    validators: Array<BlockatlasValidator>
  ): StakeHolderList {
    return Object.keys(address2stake).map(address => {
      const validator = validators.find(v => v.id === address);
      return {
        ...validator,
        amount: this.toAtom(address2stake[address]),
        coin: config
      };
    });
  }

  private validatorsAndDelegations(): any[] {
    return [
      this.getValidatorsFromBlockatlas(),
      this.accountService.address$.pipe(
        switchMap(address => this.getAddressDelegations(address))
      )
    ];
  }

  private address2StakeMap(): Observable<StakeHolderList> {
    return combineLatest([
      ...this.validatorsAndDelegations(),
      this.config
    ]).pipe(
      map((data: any[]) => {
        const approvedValidators: BlockatlasValidator[] = data[0];
        const myDelegations: CosmosDelegation[] = data[1];
        const config: CosmosProviderConfig = data[2];

        // TODO: double check most probably we no need that check
        if (!approvedValidators || !myDelegations) {
          return [];
        }

        const addresses = approvedValidators.map(d => d.id);

        // Ignore delegations to validators that isn't in a list of approved validators
        const filteredDelegations = myDelegations.filter(
          (delegation: CosmosDelegation) => {
            // TODO: use map(Object) in case we have more that 10 approved validators
            return addresses.includes(delegation.validatorAddress);
          }
        );

        const address2stakeMap = filteredDelegations.reduce(
          (acc: IAggregatedDelegationMap, delegation: CosmosDelegation) => {
            // TODO: Use BN or native browser BigInt() + polyfill
            const aggregatedAmount =
              acc[delegation.validatorAddress] || new BigNumber(0);
            const sharesAmount = +delegation.shares || new BigNumber(0);
            acc[delegation.validatorAddress] = aggregatedAmount.plus(
              sharesAmount
            );
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

  private toAtom(microatom: BigNumber): BigNumber {
    const denominator = new BigNumber(1000000);
    return microatom.dividedBy(denominator);
  }

  getAddressDelegations(address: string): Observable<CosmosDelegation[]> {
    return this.config.pipe(
      switchMap(config =>
        from(new CosmosRPC(config.endpoint).listDelegations(address))
      )
    );
  }

  getValidatorsFromBlockatlas(): Observable<BlockatlasValidator[]> {
    return this.config.pipe(
      switchMap(config =>
        from(
          new BlockatlasRPC(
            environment.blockatlasEndpoint,
            "cosmos"
          ).listValidators()
        )
      ),
      map((resp: BlockatlasValidatorResult) => {
        return resp.docs;
      })
    );
  }

  getValidatorFromBlockatlasById(validatorId): Observable<BlockatlasValidator> {
    return this.getValidatorsFromBlockatlas().pipe(
      map((validators: BlockatlasValidator[]) => {
        return validators.find((validator: BlockatlasValidator) => {
          return validator.id === validatorId;
        });
      })
    );
  }

  getAccountOnce$(address: string): Observable<CosmosAccount> {
    return this.config.pipe(
      switchMap(config =>
        from(new CosmosRPC(config.endpoint).getAccount(address))
      )
    );
  }

  broadcastTx(tx: string): Observable<CosmosBroadcastResult> {
    return this.config.pipe(
      switchMap(config =>
        from(new CosmosRPC(config.endpoint).broadcastTransaction(tx))
      )
    );
  }

  getAnnualPercent(): Observable<number> {
    return this.getValidatorsFromBlockatlas().pipe(
      map(validators => this.selectValidatorWithBestInterestRate(validators))
    );
  }
  getBalanceUSD(): Observable<BigNumber> {
    return this.balance$.pipe(
      switchMap(balance => forkJoin([of(balance), this.getPriceUSD()])),
      map(([balance, price]) => balance.multipliedBy(price))
    );
  }
  getStakedUSD(): Observable<BigNumber> {
    return this.stakedAmount$.pipe(
      switchMap(balance => forkJoin([of(balance), this.getPriceUSD()])),
      map(([balance, price]) => balance.multipliedBy(price))
    );
  }

  getStakeHolders(): Observable<StakeHolderList> {
    return this.address2StakeMap();
  }

  getPriceUSD(): Observable<BigNumber> {
    return this.config.pipe(
      switchMap(config => this.exchangeRateService.getRate(config.coin))
    );
  }
}

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
import {
  catchError,
  first,
  map,
  shareReplay,
  skipWhile,
  switchMap,
  tap
} from "rxjs/operators";
import {
  BlockatlasValidator,
  TronAccount,
  TronBlock,
  TronBroadcastResult,
  TronStakingInfo,
  TronVote
} from "@trustwallet/rpc";
import { Base64, CoinType, Hex } from "@trustwallet/types";
import { CoinService } from "../../../services/coin.service";
import {
  BALANCE_REFRESH_INTERVAL,
  STAKE_REFRESH_INTERVAL,
  StakeAction,
  StakeHolderList,
  TX_WAIT_CHECK_INTERVAL
} from "../../../coin-provider-config";
import { ExchangeRateService } from "../../../../shared/services/exchange-rate.service";
import { CoinAtlasService } from "../../../services/coin-atlas.service";
import { TronConfigService } from "./tron-config.service";
import { TronProviderConfig } from "../tron.descriptor";
import { TronRpcService } from "./tron-rpc.service";
import { TronUnboundInfoService } from "./tron-unbound-info.service";
import { AuthService } from "../../../../auth/services/auth.service";
import { fromPromise } from "rxjs/internal-compatibility";
import { TronTransaction, TronUtils } from "@trustwallet/rpc/lib";
import { CosmosTx } from "@trustwallet/rpc/lib/cosmos/models/CosmosTx";

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

  getAddressDelegations(address: string): Observable<TronVote[]> {
    return this.tronRpc.rpc.pipe(
      switchMap(rpc => from(rpc.listDelegations(address)))
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

  getStakePendingBalance(): Observable<BigNumber> {
    // There is no pending value for TRON as we have in Cosmos
    return of(new BigNumber(0));
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
        return from(rpc.broadcastTransaction(tx));
      }),
      map(result => {
        if (result.result) {
          return result;
        }
        throw Error(`TronBroadcastError: ${result.message}`);
      })
    );
  }

  prepareStakeTx(
    action: StakeAction,
    addressTo: string,
    amount: BigNumber
  ): Observable<TronTransaction> {
    return this.getAddress().pipe(
      switchMap(address => {
        return this.getAccountOnce(address);
      }),
      switchMap((account: TronAccount) => {
        switch (action) {
          case StakeAction.STAKE:
            return this.stake(account, addressTo, amount);
          case StakeAction.UNSTAKE:
            return this.unstake(account, addressTo, amount);
        }
      })
    );
  }

  getStakedToValidator(validator: string): Observable<BigNumber> {
    return combineLatest([this.config, this.getStakeHolders()]).pipe(
      map(([config, stakeholders]) => {
        const validatorStaked = stakeholders.find(
          holder => holder.id === validator
        );
        if (validatorStaked) {
          return config.toUnits(validatorStaked.amount);
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

  private requestBalance(address: string): Observable<BigNumber> {
    return this.getAccountOnce(address).pipe(
      map((account: TronAccount) => {
        return account.balance ? account.balance : new BigNumber(0);
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
        amount: new BigNumber(address2stake[address]),
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

  private getAccountOnce(address: string): Observable<TronAccount> {
    return this.tronRpc.rpc.pipe(
      switchMap(rpc => fromPromise(rpc.getAccount(address)))
    );
  }

  private getNowBlock(): Observable<TronBlock> {
    return this.tronRpc.rpc.pipe(switchMap(rpc => from(rpc.getNowBlock())));
  }

  private buildBlockHeader(): Observable<any> {
    return this.getNowBlock().pipe(
      map(block => ({
        number: block.blockHeader.rawData.number.toNumber(),
        txTrieRoot: Base64.toBase64(
          Hex.fromHex(block.blockHeader.rawData.txTrieRoot)
        ),
        parentHash: Base64.toBase64(
          Hex.fromHex(block.blockHeader.rawData.parentHash)
        ),
        witnessAddress: Base64.toBase64(
          Hex.fromHex(block.blockHeader.rawData.witnessAddress)
        ),
        timestamp: block.blockHeader.rawData.timestamp.toNumber(),
        version: block.blockHeader.rawData.version
      }))
    );
  }

  private buildFreezeTransaction(
    address: string,
    amount: BigNumber,
    duration: number
  ): Observable<any> {
    const timestamp = new Date().getTime();
    return this.buildBlockHeader().pipe(
      map(blockHeader => ({
        transaction: {
          timestamp: timestamp,
          blockHeader: blockHeader,
          freezeBalance: {
            ownerAddress: address,
            frozenBalance: amount.toFixed(),
            frozenDuration: duration,
            resource: "BANDWIDTH"
          }
        }
      }))
    );
  }

  getAddress(): Observable<string> {
    return this.config.pipe(
      switchMap(config =>
        this.authService.getAddressFromAuthorized(config.coin)
      )
    );
  }
  private buildVoteTransaction(
    address: string,
    votes: { vote_address: string; vote_count: number }[]
  ): Observable<any> {
    const timestamp = new Date().getTime();

    return this.buildBlockHeader().pipe(
      map(blockHeader => ({
        transaction: {
          timestamp: timestamp,
          blockHeader: blockHeader,
          voteWitness: {
            ownerAddress: address,
            votes: votes
          }
        }
      })),
      tap(tx => console.log(tx))
    );
  }

  private buildUnfreezeTransaction(
    address: string,
    to: string
  ): Observable<any> {
    const timestamp = new Date().getTime();
    return this.buildBlockHeader().pipe(
      map(blockHeader => ({
        transaction: {
          timestamp: timestamp,
          blockHeader: blockHeader,
          unfreezeBalance: {
            ownerAddress: address,
            resource: "BANDWIDTH"
          }
        }
      })),
      tap(tx => console.log(tx))
    );
  }

  private freezeBalance(
    address: string,
    amount: BigNumber
  ): Observable<TronBroadcastResult> {
    return this.buildFreezeTransaction(address, amount, 3).pipe(
      switchMap(tx => this.authService.signTransaction(CoinType.tron, tx)),
      switchMap(tx => this.broadcastTx(tx))
    );
  }

  private stake(
    account: TronAccount,
    to: string,
    amount: BigNumber
  ): Observable<TronTransaction> {
    return this.freezeBalance(account.address, amount).pipe(
      switchMap(_ =>
        this.addVote(account, to, amount.plus(this.getFreeFrozen(account)))
      ),
      switchMap(votes => this.updateVotes(account.address, votes)),
      switchMap(result => this.waitForTx(result.code))
    );
  }

  private getFreeFrozen(account: TronAccount): BigNumber {
    const freeFrozen = account.frozen
      ? account.frozen
          .reduce(
            (acc, frozen) => acc.plus(frozen.frozenBalance),
            new BigNumber(0)
          )
          .integerValue()
      : new BigNumber(0);

    const result = freeFrozen.minus(
      account.votes.reduce((acc, vote) => vote.voteCount + acc, 0)
    );

    return result.isGreaterThan(0)
      ? TronUtils.fromTron(result)
      : new BigNumber(0);
  }

  private unstake(
    account: TronAccount,
    to: string,
    amount: BigNumber
  ): Observable<TronTransaction> {
    const votes$ = this.removeVote(account, to, amount);
    const frozenBalance$ = combineLatest([this.config, votes$]).pipe(
      map(([cfg, votes]) =>
        cfg.toUnits(
          new BigNumber(votes.reduce((acc, v) => acc + v.vote_count, 0))
        )
      )
    );
    const unfreezeBalance$ = this.buildUnfreezeTransaction(
      account.address,
      to
    ).pipe(
      switchMap(tx => this.authService.signTransaction(CoinType.tron, tx)),
      switchMap(tx => this.broadcastTx(tx))
    );

    return unfreezeBalance$.pipe(
      switchMap(_ => frozenBalance$),
      switchMap(frozenBalance =>
        this.freezeBalance(account.address, frozenBalance)
      ),
      switchMap(_ => votes$),
      switchMap(votes => this.updateVotes(account.address, votes)),
      switchMap(result => this.waitForTx(result.code))
    );
  }

  private addVote(
    account: TronAccount,
    to: string,
    amount: BigNumber
  ): Observable<{ vote_address: string; vote_count: number }[]> {
    return this.config.pipe(
      map(cfg => [
        ...this.getVotes(account),
        {
          vote_address: to,
          vote_count: cfg.toCoin(amount).toNumber()
        }
      ]),
      shareReplay(1)
    );
  }

  private getVotes(account: TronAccount): any[] {
    return account.votes
      ? account.votes.map(v => ({
          vote_address: v.voteAddress,
          vote_count: v.voteCount
        }))
      : [];
  }

  private removeVote(
    account: TronAccount,
    to: string,
    amount: BigNumber
  ): Observable<{ vote_address: string; vote_count: number }[]> {
    return this.config.pipe(
      map(cfg =>
        account.votes
          .map(v => {
            if (v.voteAddress === to) {
              return {
                vote_address: v.voteAddress,
                vote_count: Math.max(
                  v.voteCount - cfg.toCoin(amount).toNumber(),
                  0
                )
              };
            }

            return {
              vote_address: v.voteAddress,
              vote_count: v.voteCount
            };
          })
          .filter(v => v.vote_count > 0)
      ),
      shareReplay(1)
    );
  }

  private updateVotes(
    address: string,
    votes: { vote_address: string; vote_count: number }[]
  ): Observable<TronBroadcastResult> {
    return this.buildVoteTransaction(address, votes).pipe(
      switchMap(tx => this.authService.signTransaction(CoinType.tron, tx)),
      switchMap(tx => this.broadcastTx(tx))
    );
  }

  hasProvider(): Observable<boolean> {
    return this.authService.hasProvider(CoinType.tron);
  }

  isUnstakeEnabled(): Observable<boolean> {
    const now = new Date();
    // This function checks if there is any frozen expire time in the future
    return this.authService.getAddressFromAuthorized(CoinType.tron).pipe(
      switchMap(address => this.getAccountOnce(address)),
      map(
        account => account.frozen.filter(f => f.expireTime > now).length === 0
      ),
      catchError(_ => of(false))
    );
  }

  waitForTx(txhash: string): Observable<TronTransaction> {
    return interval(TX_WAIT_CHECK_INTERVAL).pipe(
      switchMap(() => this.getStakingTransaction(txhash)),
      skipWhile(tx => !tx),
      first()
    );
  }

  getStakingTransaction(txhash: string): Observable<TronTransaction> {
    return this.tronRpc.rpc.pipe(
      switchMap(rpc => rpc.getTransaction(txhash)),
      catchError(_ => of(null))
    );
  }
}

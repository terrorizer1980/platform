import { Inject, Injectable } from "@angular/core";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  forkJoin,
  from,
  of,
  timer
} from "rxjs";
import { HttpClient } from "@angular/common/http";
import BigNumber from "bignumber.js";
import { first, map, switchMap, tap } from "rxjs/operators";
import {
  BlockatlasValidator,
  TronAccount,
  TronBlock,
  TronBroadcastResult,
  TronStakingInfo,
  TronUtils,
  TronVote
} from "@trustwallet/rpc";
import { CoinType, Utils } from "@trustwallet/types";
import { TrustProvider } from "@trustwallet/provider";
import { CoinService } from "../../../services/coin.service";
import { AccountService } from "../../../../shared/services/account.service";
import { BALANCE_REFRESH_INTERVAL, STAKE_REFRESH_INTERVAL, StakeAction, StakeHolderList } from "../../../coin-provider-config";
import { ExchangeRateService } from "../../../../shared/services/exchange-rate.service";
import { CoinAtlasService } from "../../../services/coin-atlas.service";
import { TronConfigService } from "./tron-config.service";
import { TronProviderConfig } from "../tron.descriptor";
import { TronRpcService } from "./tron-rpc.service";
import { TronUnboundInfoService } from "./tron-unbound-info.service";

export const TronServiceInjectable = [
  TronConfigService,
  HttpClient,
  AccountService,
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
    private accountService: AccountService,
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

  getAddress(): Observable<string> {
    return this.config.pipe(
      switchMap(config => this.accountService.getAddress(config.coin))
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
      this.accountService
        .getAddress(CoinType.tron)
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
      switchMap(rpc => from(rpc.getAccount(address)))
    );
  }

  private getNowBlock(): Observable<TronBlock> {
    return this.tronRpc.rpc.pipe(
      switchMap(rpc => from(rpc.getNowBlock()))
    );
  }

  private buildBlockHeader(timestamp: number): Observable<any> {
    return this.getNowBlock().pipe(
      map(block => ({
        timestamp: timestamp,
        txTrieRoot: Utils.toBase64(Utils.fromHex(block.blockHeader.rawData.txTrieRoot)),
        parentHash: Utils.toBase64(Utils.fromHex(block.blockID)),
        witnessAddress: Utils.toBase64(Utils.fromHex(block.blockHeader.rawData.witnessAddress)),
        version: block.blockHeader.rawData.version
      }))
    );
  }

  private buildFreezeTransaction(address: string, frozenBalance: BigNumber, frozenDuration: number): Observable<string> {
    const timestamp = new Date().getTime();
    return this.buildBlockHeader(timestamp).pipe(
      map(blockHeader => JSON.stringify({
        transaction: {
          timestamp: timestamp,
          blockHeader: blockHeader,
          freezeBalance: {
            ownerAddress: address,
            frozenBalance: frozenBalance.toNumber(),
            frozenDuration: frozenDuration,
            resource: "BANDWIDTH"
          }
        }
      })),
      tap(tx => console.log(tx))
    );
  }

  private buildVoteTransaction(address: string, votes: { address: string, count: number }[]): Observable<string> {
    const timestamp = new Date().getTime();
    return this.buildBlockHeader(timestamp).pipe(
      map(blockHeader => JSON.stringify({
        transaction: {
          timestamp: timestamp,
          blockHeader: blockHeader,
          voteWitness: {
            ownerAddress: address,
            votes: votes.map(v => ({ vote_address: v.address, vote_count: v.count }))
          }
        }
      })),
      tap(tx => console.log(tx))
    );
  }

  private buildUnfreezeTransaction(address: string): Observable<string> {
    const timestamp = new Date().getTime();
    return this.buildBlockHeader(timestamp).pipe(
      map(blockHeader => JSON.stringify({
        transaction: {
          timestamp: timestamp,
          blockHeader: blockHeader,
          unfreezeBalance: {
            ownerAddress: address,
            resource: "BANDWIDTH",
          }
        }
      }))
    );
  }

  private freezeBalance(
    account: TronAccount,
    amount: BigNumber
  ): Observable<TronBroadcastResult> {
    return this.buildFreezeTransaction(account.address, amount, 3).pipe(
      switchMap(tx => from(TrustProvider.signTransaction(CoinType.tron, tx))),
      switchMap(tx => this.broadcastTx(tx)),
      map(result => {
        if (result.result) { return result; }
        const message = new TextDecoder("utf-8").decode(Utils.fromHex(result.message));
        throw Error(`TronBroadcastError: ${message}`);
      })
    );
  }

  private stake(
    account: TronAccount,
    to: string,
    amount: BigNumber
  ): Observable<TronBroadcastResult> {
    const votes = [
      { address: to, count: amount.toNumber() }
    ];

    return this.freezeBalance(account, amount).pipe(
      switchMap( _ => this.buildVoteTransaction(account.address, votes)),
      switchMap(tx => from(TrustProvider.signTransaction(CoinType.tron, tx))),
      switchMap(tx => this.broadcastTx(tx)),
      map(result => {
        if (result.result) { return result; }
        const message = new TextDecoder("utf-8").decode(Utils.fromHex(result.message));
        throw Error(`TronBroadcastError: ${message}`);
      })
    );
  }

  private unstake(
    account: TronAccount,
    to: string,
    amount: BigNumber
  ): Observable<TronBroadcastResult> {
    return this.buildUnfreezeTransaction(account.address).pipe(
      switchMap(tx => from(TrustProvider.signTransaction(CoinType.tron, tx))),
      switchMap(tx => this.broadcastTx(tx)),
      map(result => {
        if (result.result) { return result; }
        const message = new TextDecoder("utf-8").decode(Utils.fromHex(result.message));
        throw Error(`TronBroadcastError: ${message}`);
      })
    );
  }
}

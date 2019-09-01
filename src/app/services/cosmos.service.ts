import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, from, merge, Observable, of, timer } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CosmosAccount, CosmosRPC } from '@trustwallet/rpc';
import BigNumber from 'bignumber.js';
import { map, switchMap } from 'rxjs/operators';
import { toAtom } from '../helpers';
import { BlockatlasRPC, BlockatlasValidatorResult, CosmosBroadcastResult } from '@trustwallet/rpc/lib';
import { CosmosDelegation } from '@trustwallet/rpc/src/cosmos/models/CosmosDelegation';
import { blockatlasEndpoint, cosmosEndpoint } from '../endpoints';
import { AccountService } from './account.service';
import { BlockatlasValidator } from '@trustwallet/rpc/src/blockatlas/models/BlockatlasValidator';

// TODO: use BigInt with polyfill everywhere
type NullableNumber = null | number | BigNumber;

const BALANCE_REFRESH_INTERVAL = 60000;
const STAKE_REFRESH_INTERVAL = 115000;

@Injectable({
  providedIn: 'root'
})
export class CosmosService {
  cosmosRpc: CosmosRPC;
  blockatlasRpc: BlockatlasRPC;

  // address: string;
  // private balanceSubject: BehaviorSubject<NullableNumber> = new BehaviorSubject(null);
  // private stakedSubject: BehaviorSubject<NullableNumber> = new BehaviorSubject(null);

  private _manualRefresh: BehaviorSubject<boolean> = new BehaviorSubject(true);

  balance$: Observable<number>;
  stakedAmount$: Observable<number>;

  constructor(private http: HttpClient, accountService: AccountService) {

    this.blockatlasRpc = new BlockatlasRPC(blockatlasEndpoint, 'cosmos');
    this.cosmosRpc = new CosmosRPC(cosmosEndpoint);

    // Fires on address change or manual refresh
    const buildPipeline = (milliSeconds): Observable<string> => combineLatest([accountService.address$, this._manualRefresh]).pipe(
      switchMap((x: any[]) => {
        const [address, skip] = x;
        return timer(0, milliSeconds).pipe(
          map(() => address)
        );
      }),
    );

    this.balance$ = buildPipeline(BALANCE_REFRESH_INTERVAL).pipe(
      switchMap((address) => {
        // TODO: f
        return this.requestBalance(address);
      }),
      map((uAtom) => toAtom(uAtom))
    );

    this.stakedAmount$ = buildPipeline(STAKE_REFRESH_INTERVAL).pipe(
      switchMap((address) => {
        return this.requestStakedAmount(address);
      }),
      map((uAtom) => toAtom(uAtom))
    );
  }

  refresh() {
    this._manualRefresh.next(true);
  }

  private requestBalance(address: string): Observable<BigNumber> {
    return from(this.cosmosRpc.getAccount(address)).pipe(
      map((account: CosmosAccount) => {

        // TODO: add type annotation once it exported by library (Coin)
        const balances = (account as CosmosAccount).coins;

        // TODO: check, probably with library toUpperCase is no needed here
        const result = balances.find((coin) => coin.denom.toUpperCase() === 'UATOM');
        return result.amount;
      })
    );
  }

  private requestStakedAmount(address: string): Observable<BigNumber> {
    return from(this.cosmosRpc.listDelegations(address)).pipe(
      map((delegations: CosmosDelegation[]) => {
        const shares = delegations && delegations.map((d: CosmosDelegation) => d.shares) || [];
        return BigNumber.sum(...shares);
      })
    );
  }

  getAddressDelegations(address: string): Observable<CosmosDelegation[]> {
    return from(this.cosmosRpc.listDelegations(address));
  }

  getValidatorsFromBlockatlas(): Observable<BlockatlasValidator[]> {
    return from(this.blockatlasRpc.listValidators()).pipe(
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
    return from(this.cosmosRpc.getAccount(address));
  }

  broadcastTx(tx: string): Observable<CosmosBroadcastResult> {
    return from(this.cosmosRpc.broadcastTransaction(tx));
  }
}

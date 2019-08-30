import {Injectable} from '@angular/core';
import {from, Observable, timer} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {CosmosAccount, CosmosRPC} from '@trustwallet/rpc';
import BigNumber from 'bignumber.js';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {toAtom} from '../helpers';
import {BlockatlasRPC, BlockatlasValidatorResult, CosmosBroadcastResult} from '@trustwallet/rpc/lib';
import {CosmosDelegation} from '@trustwallet/rpc/src/cosmos/models/CosmosDelegation';
import {blockatlasEndpoint, cosmosEndpoint} from '../endpoints';
import {AccountService} from './account.service';
import {BlockatlasValidator} from '@trustwallet/rpc/src/blockatlas/models/BlockatlasValidator';


@Injectable({
  providedIn: 'root'
})
export class CosmosService {
  readonly instance$: Observable<CosmosServiceInstance>;

  constructor(private http: HttpClient, accountService: AccountService) {
    this.instance$ = accountService.address$.pipe(
      map((address: string) => {
        return new CosmosServiceInstance(this.http, address);
      })
    );
  }
}

export class CosmosServiceInstance {
  cosmosRpc: CosmosRPC;
  blockatlasRpc: BlockatlasRPC;

  balance$: Observable<number | BigNumber>;
  stakedAmount$: Observable<number | BigNumber>;

  constructor(private http: HttpClient, private address: string) {
    this.blockatlasRpc = new BlockatlasRPC(blockatlasEndpoint, 'cosmos');
    this.cosmosRpc = new CosmosRPC(cosmosEndpoint);


    // TODO: move timeout to console
    this.balance$ = timer(0, 5000).pipe(
      switchMap(() => {
        return this.requestBalance();
      }),
      map((balance) => {
        return toAtom(balance);
      }),
      shareReplay(1)
    );
    this.balance$.subscribe(); // start subscription right here


    // TODO: move timeout to console
    this.stakedAmount$ = timer(0, 15000).pipe(
      switchMap(() => {
        return this.requestStakedAmount();
      }),
      map((balance) => {
        return toAtom(balance);
      }),
      shareReplay(1)
    );
    this.balance$.subscribe(); // start subscription right here

  }

  requestBalance(): Observable<any> {
    return from(this.cosmosRpc.getAccount(this.address)).pipe(
      map((account: CosmosAccount) => {
        const balances = (account as CosmosAccount).coins;
        const result = balances.find((coin) => coin.denom.toUpperCase() === 'UATOM');
        return result.amount;
      })
    );
  }

  requestStakedAmount(): Observable<number> {
    return from(this.cosmosRpc.listDelegations(this.address)).pipe(
      map((delegations: CosmosDelegation[]) => {
        const shares = delegations && delegations.map((d: CosmosDelegation) => d.shares) || [];
        const sum = BigNumber.sum(...shares);
        return toAtom(sum);
      })
    );
  }

  getDelegations(): Observable<CosmosDelegation[]> {
    return from(this.cosmosRpc.listDelegations(this.address));
  }

  getValidators(): Observable<BlockatlasValidatorResult> {
    return from(this.blockatlasRpc.listValidators());
  }

  getValidator(validatorId): Observable<BlockatlasValidator> {
    return this.getValidators().pipe(
      map((resp: BlockatlasValidatorResult) => {
        return resp.docs.find((validator: BlockatlasValidator) => {
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

import {Injectable} from '@angular/core';
import {combineLatest, from, Observable, timer} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {CosmosRPC, CosmosAccount} from '@trustwallet/rpc';
import BigNumber from 'bignumber.js';
import {map, switchMap} from 'rxjs/operators';
import {CoinType} from '@trustwallet/types/lib/CoinType';
import {IPriceResponse} from './dto';
import {formatLikeEthAddress, toAtom} from './helpers';
import {BlockatlasRPC, BlockatlasValidatorResult, CosmosBroadcastResult} from '@trustwallet/rpc/lib';
import {CosmosDelegation} from '@trustwallet/rpc/src/cosmos/models/CosmosDelegation';

const priceUri = 'https://api.trustwallet.com/prices';
const cosmosEndpoint = 'https://cosmos-rpc.trustwalletapp.com';
const blockatlasEndpoint = 'http://blockatlas.trustwalletapp.com';

@Injectable({
  providedIn: 'root'
})
export class CosmosService {
  readonly mapping: { [key: string]: CosmosServiceInstance } = {};

  constructor(private http: HttpClient) {
  }

  getInstance(address: string): CosmosServiceInstance {

    if (this.mapping[address]) {
      return this.mapping[address];
    }

    const instance = new CosmosServiceInstance(this.http, address);
    this.mapping[address] = instance;
    return instance;
  }
}

export class CosmosServiceInstance {
  cosmosRpc: CosmosRPC;
  blockatlasRpc: BlockatlasRPC;
  currentAccount: string;
  balance$: Observable<number | BigNumber>;

  constructor(private http: HttpClient, private account: string) {
    this.blockatlasRpc = new BlockatlasRPC(blockatlasEndpoint, 'cosmos');
    this.cosmosRpc = new CosmosRPC(cosmosEndpoint);
    this.currentAccount = account;

    this.balance$ = timer(0, 5000).pipe(
      switchMap(() => {
        return this.getBalanceOnce$(account);
      }),
      map((balance) => {
        return toAtom(balance);
      })
    );
  }

  getBalanceOnce$(address: string): Observable<any> {
    return from(this.cosmosRpc.getAccount(address)).pipe(
      map((account: CosmosAccount) => {
        const balances = (account as CosmosAccount).coins;
        const result = balances.find((coin) => coin.denom.toUpperCase() === 'UATOM');
        return result.amount;
      })
    );
  }

  getPrice(): Observable<string> {
    const addr = formatLikeEthAddress(CoinType.cosmos);
    const body = {
      'currency': 'USD',
      'tokens': [
        {
          'contract': addr
        }
      ]
    };

    return this.http.post(priceUri, body).pipe(
      map((result: IPriceResponse) => {
        const coins = result.docs;
        const cosmos = coins.find((coin) => coin.contract === addr);
        return cosmos.price;
      })
    );
  }

  getStakedAmount(): Observable<number> {
    return from(this.cosmosRpc.listDelegations(this.account)).pipe(
      map((delegations: CosmosDelegation[]) => {
        const shares = delegations && delegations.map((d: CosmosDelegation) => d.shares) || [];
        return (BigNumber.sum(...shares).toNumber() / 1000000);
      })
    );
  }

  getDelegations(): Observable<any> {
    return from(this.cosmosRpc.listDelegations(this.account));
  }

  getValidators(): Observable<BlockatlasValidatorResult> {
    return from(this.blockatlasRpc.listValidators());
  }

  getAccountOnce$(address: string): Observable<CosmosAccount> {
    return from(this.cosmosRpc.getAccount(address));
  }

  broadcastTx(tx: string): Observable<CosmosBroadcastResult> {
    return from(this.cosmosRpc.broadcastTransaction(tx));
  }
}

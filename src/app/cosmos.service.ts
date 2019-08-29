import {Injectable} from '@angular/core';
import {from, Observable, timer} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {CosmosAccount, CosmosRPC} from '@trustwallet/rpc';
import BigNumber from 'bignumber.js';
import {map, switchMap} from 'rxjs/operators';
import {CoinType} from '@trustwallet/types/lib/CoinType';
import {IPriceResponse, IValidators} from './dto';
import {formatLikeEthAddress, toAtom} from './helpers';

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
  rpc: CosmosRPC;
  currentAccount: string;
  balance$: Observable<number | BigNumber>;

  constructor(private http: HttpClient, private account: string) {
    this.rpc = new CosmosRPC('https://cosmos-rpc.trustwalletapp.com');
    // this.rpc = new CosmosRPC('https://stargate.cosmos.network');

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
    return from(this.rpc.getAccount(address)).pipe(
      map((account: CosmosAccount) => {
        const balances = (account as CosmosAccount).coins;
        // @ts-ignore
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

    return this.http.post('https://api.trustwallet.com/prices', body).pipe(
      map((result: IPriceResponse) => {
        const coins = result.docs;
        const cosmos = coins.find((coin) => coin.contract === addr);
        return cosmos.price;
      })
    );
  }

  getLargestRate(): Observable<string> {
    const url = 'https://blockatlas.trustwalletapp.com/v2/cosmos/staking/validators';
    // const url = ' http://142.93.172.157:9000/blockatlas//v2/cosmos/staking/validators';
    return this.http.get(url).pipe(
      map((x) => {
        return x;
      }),

      map((docs: IValidators) => {
        const annualRates = [];
        // console.log(docs);
        // @ts-ignore
        docs.forEach((i) => {
          // @ts-ignore
          annualRates.push(docs[i].reward.annual);
        });
        return annualRates;
      }),

      map((annualRates: number[]) => {
        // @ts-ignore
        const largestRateToDisplay = Math.max.apply(annualRates);
        return largestRateToDisplay.toFixed(2);
      })
    );
  }

  getStakedAmount(): Observable<number> {
    return from(this.rpc.listDelegations(this.account)).pipe(
      map((delegations: any[]) => {

        const sums = [];

        if (!delegations) {
          return 0;
        }

        for (let i = 0; i < delegations.length; i++) {
          sums.push(delegations[i].shares);
        }

        return (BigNumber.sum(...sums).toNumber() / 1000000);
      })
    );
  }

  getDelegations(): Observable<any> {
    return from(this.rpc.listDelegations(this.account));
  }

  getValidators(): Observable<IValidators> {
    const url = 'https://blockatlas.trustwalletapp.com/v2/cosmos/staking/validators';
    // const url = 'http://142.93.172.157:9000/blockatlas/v2/cosmos/staking/validators';
    return this.http.get(url).pipe(
      map((response: IValidators) => {
        // console.log(response);
        return response;
      })
    );
  }

  getTransactionInfo(address: string): Observable<any> {
    return from(this.rpc.getAccount(address)).pipe(
      map((account: CosmosAccount) => {
        const accountNumber = ((account as CosmosAccount).accountNumber).toString();
        const sequence = ((account as CosmosAccount).sequence);
        return {sequence, accountNumber};
      })
    );
  }
}

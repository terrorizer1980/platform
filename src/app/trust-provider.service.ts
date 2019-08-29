import {Injectable} from '@angular/core';
import {from, interval, Observable} from 'rxjs';
import {filter, map, shareReplay, switchMap, take} from 'rxjs/operators';
import {TrustProvider} from '@trustwallet/provider';

@Injectable({
  providedIn: 'root'
})
export class TrustProviderService {

  constructor() {
    if (TrustProvider.isAvailable) {
      this.currentAccount$ = this.getAddressOnce(this.network).pipe(
        shareReplay(1)
      );
      this.currentAccount$.subscribe();
    }


  }

  readonly network = 118; // Cosmos
  currentAccount$ : Observable<string>;

  async transactionSign(
    message : string,
    coin : number,
    addressTo : string,
    addressFrom : string,
    amount : string,
    sequence : string,
    accountNumber : string ) : Promise<any> {

    let network = coin; // Cosmos
    let transaction;

    if (message == 'stake') {
      transaction = {
        typePrefix: 'auth/StdTx',
        accountNumber: accountNumber,
        chainId: 'cosmoshub-2',
        fee: {
          amounts: [
            {
              denom: 'uatom',
              amount: '5000',
            },
          ],
          gas: '200000',
        },
        sequence: sequence,
        stakeMessage: {
          delegatorAddress: addressFrom,
          validatorAddress: addressTo,
          amount: {
            denom: 'uatom',
            amount: amount,
          },
        },
      };
    } else if (message == 'unstake') {
      transaction = {
        typePrefix: 'auth/StdTx',
        accountNumber: accountNumber,
        chainId: 'cosmoshub-2',
        fee: {
          amounts: [
            {
              denom: 'uatom',
              amount: '5000',
            },
          ],
          gas: '200000',
        },
        sequence: sequence,
        unstakeMessage: {
          delegatorAddress: addressFrom,
          validatorAddress: addressTo,
          amount: {
            denom: 'uatom',
            amount: amount,
          },
        },
      };
    }

    let result = await TrustProvider.signTransaction(network, transaction);
    alert(result);
    // @ts-ignore
    return result;
  }


  getAddressOnce( network : number ) : Observable<string> {

    return from(TrustProvider.getAccounts()).pipe(
      map(( accounts : any ) => {
        const accountRaw = accounts.find(( account ) => account.network === network);
        // @ts-ignore
        alert(JSON.stringify(accountRaw.address));
        // @ts-ignore
        return JSON.stringify(accountRaw.address)
          .replace('"', '')
          .replace('"', '');
      })
    )

    // return interval(2000).pipe(
    //   // @ts-ignore
    //   filter(() => !!(window as any).trustProvider),
    //   take(1),
    //   switchMap(() => {
    //     // @ts-ignore
    //     return from((window as any).trustProvider.getAccounts());
    //   }),
    //   // @ts-ignore
    //   map((accounts: Array<any>) => {
    //     const accountRaw = accounts.find((account) => account.network === network);
    //     // @ts-ignore
    //     return JSON.stringify(accountRaw.address)
    //       .replace('"', '')
    //       .replace('"', '');
    //   })
    // );
  }
}

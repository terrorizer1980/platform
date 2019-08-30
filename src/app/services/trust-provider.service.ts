import {Injectable} from '@angular/core';
import {from, Observable, of} from 'rxjs';
import {map, shareReplay, take} from 'rxjs/operators';
import {TrustProvider} from '@trustwallet/provider';
import {CoinType} from '@trustwallet/types/lib/CoinType';

@Injectable({
  providedIn: 'root'
})
export class TrustProviderService {

  currentAccount$: Observable<string>;

  constructor() {
    if (TrustProvider.isAvailable) {
      this.currentAccount$ = this.getAddressOnce$(CoinType.cosmos);
    } else {
      // For dev purposes only
      this.currentAccount$ = of('cosmos1cj7u0wpe45j0udnsy306sna7peah054upxtkzk');
    }

    this.currentAccount$.pipe(
      take(1),
      shareReplay(1)
    ).subscribe();
  }

  signStake(
    coin: CoinType,
    addressTo: string,
    addressFrom: string,
    amount: string,
    sequence: string,
    accountNumber: string): Observable<string> {

    const transaction = {
      typePrefix: 'auth/StdTx',
      accountNumber: accountNumber,
      chainId: 'cosmoshub-2',
      fee: {
        amounts: [
          {
            denom: 'uatom',
            amount: '0',
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

    return from(TrustProvider.signTransaction(coin, transaction));
  }

  transactionSign(
    message: string,
    coin: CoinType,
    addressTo: string,
    addressFrom: string,
    amount: string,
    sequence: string,
    accountNumber: string): Observable<string> {

    let transaction;

    if (message === 'stake') {
      transaction = {
        typePrefix: 'auth/StdTx',
        accountNumber: accountNumber,
        chainId: 'cosmoshub-2',
        fee: {
          amounts: [
            {
              denom: 'uatom',
              amount: '0',
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
    } else if (message === 'unstake') {
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
    // @ts-ignore
    return TrustProvider.signTransaction(network, transaction);
  }


  getAddressOnce$(network: CoinType): Observable<string> {
    return from(TrustProvider.getAccounts()).pipe(
      map((accounts: any) => {
        const accountRaw = accounts.find((account) => account.network === network);
        return JSON.stringify(accountRaw.address)
          .replace('"', '')
          .replace('"', '');
      }),
    );
  }
}

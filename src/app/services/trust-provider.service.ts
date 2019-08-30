import {Injectable} from '@angular/core';
import {from, Observable, of} from 'rxjs';
import {map, shareReplay, take} from 'rxjs/operators';
import {TrustProvider} from '@trustwallet/provider';
import {CoinType} from '@trustwallet/types/lib/CoinType';

@Injectable({
  providedIn: 'root'
})
export class TrustProviderService {

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

    return from(TrustProvider.signTransaction(coin, transaction));
  }

  signUnstake(
      coin: CoinType,
      addressTo: string,
      addressFrom: string,
      amount: string,
      sequence: string,
      accountNumber: string ): Observable<string> {

      const transaction = {
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

      return from(TrustProvider.signTransaction(coin, transaction));
  }
}

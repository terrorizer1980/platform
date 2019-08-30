import {Injectable} from '@angular/core';
import {TrustProvider} from '@trustwallet/provider/lib';
import {Account} from '@trustwallet/types';
import {CoinType} from '@trustwallet/types/lib/CoinType';
import {from, Observable, of} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

function extractAddress(account: Account): string {
  return JSON.stringify(account.address)
    .replace('"', '')
    .replace('"', '');
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  address$: Observable<string>;

  constructor() {

    if (!TrustProvider.isAvailable) {
      // TODO: add input fields to the UI for debugging, or take / whath it from local storage
      this.address$ = of('cosmos1cj7u0wpe45j0udnsy306sna7peah054upxtkzk');
      return;
    }

    this.address$ = from(TrustProvider.getAccounts()).pipe(
      map((accounts) => {
        // a.network on iOS
        // a.id on Android
        const account = accounts.find((a: Account) => (a.network || (a as any).id) === CoinType.cosmos);
        return extractAddress(account);
      }),
      shareReplay(1),
    );

    this.address$.subscribe(); // Init address retrieval immediately
  }
}

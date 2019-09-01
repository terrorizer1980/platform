import {Injectable} from '@angular/core';
import {TrustProvider} from '@trustwallet/provider/lib';
import {Account} from '@trustwallet/types';
import {CoinType} from '@trustwallet/types/lib/CoinType';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private addressSubject: BehaviorSubject<string> = new BehaviorSubject(null);
  address$: Observable<string>;

  get address(): string {
    return this.addressSubject.value;
  }

  constructor() {

    if (!TrustProvider.isAvailable) {
      // TODO: add input fields to the UI for debugging, or take / whath it from local storage
      this.addressSubject.next('cosmos1cj7u0wpe45j0udnsy306sna7peah054upxtkzk');
      // cosmos1cj7u0wpe45j0udnsy306sna7peah054upxtkzk
      return;
    }

    TrustProvider.getAccounts().then((accounts) => {
      try {
        // a.network on iOS
        // a.id on Android
        const account = accounts.find((a: Account) => (a.network || (a as any).id) === CoinType.cosmos);
        return account.address;
      } catch (err) {
        alert(err);
      }
    }, (err) => {
      alert(err);
    });

    this.address$ = this.addressSubject.asObservable()
      .pipe(
        // BehaviorSubject starts from null, so let's by pass only not null
        filter((addr) => !!addr)
      );
  }
}

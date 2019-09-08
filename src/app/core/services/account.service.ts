import { Injectable } from "@angular/core";
import { TrustProvider } from "@trustwallet/provider";
import { Account, CoinType } from "@trustwallet/types";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class AccountService {
  address$: ReplaySubject<string> = new ReplaySubject();

  constructor() {
    if (!TrustProvider.isAvailable) {
      // TODO: add input fields to the UI for debugging, or take / whath it from local storage
      // cosmos1nswq3fz33h8e84xw0tqxaxw4ggkmfgw5lxk4nt
      this.address$.next("cosmos1cj7u0wpe45j0udnsy306sna7peah054upxtkzk");
      return;
    }

    TrustProvider.getAccounts().then(
      accounts => {
        try {
          // a.network on iOS
          // a.id on Android
          const account = accounts.find(
            (a: Account) => (a.network || (a as any).id) === CoinType.cosmos
          );
          this.address$.next(account.address);
        } catch (err) {
          alert(err);
        }
      },
      err => {
        alert(err);
      }
    );
  }
}

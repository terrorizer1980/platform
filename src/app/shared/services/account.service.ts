import { Injectable } from "@angular/core";
import { TrustProvider } from "@trustwallet/provider";
import { Account, CoinType } from "@trustwallet/types";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { fromPromise } from "rxjs/internal-compatibility";
import { CoinNotSupportedException } from "../../exceptions/coin-not-supported-exception";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class AccountService {
  constructor() {}

  getAddress(coin: CoinType): Observable<string> {
    if (environment.production === false) {
      if (!TrustProvider.isAvailable) {
        // return of("cosmos130q48agm6yal2uxp3rgv3ptlwmwwk099c5nwj4");
        return of("cosmos1cj7u0wpe45j0udnsy306sna7peah054upxtkzk");
      }
    }

    return fromPromise(TrustProvider.getAccounts()).pipe(
      map(accounts => {
        const account = accounts.find((a: Account) => a.network === coin);
        if (!account) {
          throw new CoinNotSupportedException(coin);
        }
        return account.address;
      })
    );
  }
}

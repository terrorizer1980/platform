import { AuthProvider } from "../../auth-provider";
import { from, Observable, of, throwError } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { fromPromise } from "rxjs/internal-compatibility";
import { catchError, map } from "rxjs/operators";
import { CoinType, Account } from "@trustwallet/types";
import { TrustProvider } from "@trustwallet/provider";
import { CoinNotSupportedException } from "../../coin-not-supported-exception";
import { Injectable } from "@angular/core";
import { AuthModule } from "../../../auth.module";
import { Errors } from "../../../../shared/consts";

@Injectable({ providedIn: AuthModule })
export class TrustAuthProvider implements AuthProvider {
  getAddress(coin: CoinType): Observable<string> {
    // if (environment.production === false) {
    //   if (!TrustProvider.isAvailable) {
    //     switch (coin) {
    //       case CoinType.cosmos:
    //         // return of("cosmos130q48agm6yal2uxp3rgv3ptlwmwwk099c5nwj4");
    //         return of("cosmos1cj7u0wpe45j0udnsy306sna7peah054upxtkzk");
    //       case CoinType.tron:
    //         return of("TKYT8YiiL58h8USHkmVEhCYpNfgSyiWPcW");
    //     }
    //   }
    // }

    if (TrustProvider && TrustProvider.isAvailable) {
      return fromPromise(TrustProvider.getAccounts()).pipe(
        map(accounts => {
          const account = accounts.find((a: Account) => a.network === coin);
          if (!account) {
            throw new CoinNotSupportedException(coin);
          }
          return account.address;
        })
      );
    } else {
      return throwError(new CoinNotSupportedException(coin));
    }
  }

  authorize(): Observable<Account[]> {
    if (TrustProvider && TrustProvider.isAvailable) {
      return fromPromise(TrustProvider.getAccounts());
    } else {
      return of(null);
    }
  }

  isAuthorized(): Observable<boolean> {
    return of(TrustProvider && TrustProvider.isAvailable);
  }

  get name(): string {
    return "Trust Wallet";
  }

  get id(): string {
    return "trustwallet";
  }

  get icon(): string {
    return "icon_trust.svg";
  }

  get active(): boolean {
    return true;
  }

  signTransaction(network: CoinType, transaction: any): Observable<string> {
    return from(TrustProvider.signTransaction(network, transaction));
  }
}

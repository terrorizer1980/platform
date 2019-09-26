import { AuthProvider } from "../../auth-provider";
import { from, Observable, of, throwError } from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import { map } from "rxjs/operators";
import { Account, CoinType } from "@trustwallet/types";
import { TrustProvider } from "@trustwallet/provider";
import { CoinNotSupportedException } from "../../coin-not-supported-exception";
import { Injectable } from "@angular/core";
import { AuthModule } from "../../../auth.module";
import { STAKE_MEMO } from "../../../../shared/consts";

@Injectable({ providedIn: AuthModule })
export class TrustAuthProvider implements AuthProvider {
  getAddress(coin: CoinType): Observable<string> {
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
    if (network === CoinType.cosmos) {
      transaction.memo = STAKE_MEMO;
    }
    return from(TrustProvider.signTransaction(network, transaction));
  }
}

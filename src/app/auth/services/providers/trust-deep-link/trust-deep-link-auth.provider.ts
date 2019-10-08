import { AuthProvider } from "../../auth-provider";
import { Observable, of, throwError, timer } from "rxjs";
import { map } from "rxjs/operators";
import { Account, CoinType } from "@trustwallet/types";
import { CoinNotSupportedException } from "../../coin-not-supported-exception";
import { Injectable } from "@angular/core";
import { AuthModule } from "../../../auth.module";

@Injectable({ providedIn: AuthModule })
export class TrustDeepLinkAuthProvider implements AuthProvider {
  getAddress(coin: CoinType): Observable<string> {
    return throwError(new CoinNotSupportedException(coin));
  }

  authorize(): Observable<Account[]> {
    window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=${window.location.href}`;
    return timer(10000).pipe(map(_ => null));
  }

  isAuthorized(): Observable<boolean> {
    return of(false);
  }

  get name(): string {
    return "Trust Wallet";
  }

  get id(): string {
    return "trustwalletdeeplink";
  }

  get icon(): string {
    return "icon_trust.svg";
  }

  get active(): boolean {
    return true;
  }

  disconnected(): Observable<boolean> {
    return of(false);
  }

  signTransaction(network: CoinType, transaction: any): Observable<string> {
    return of(null);
  }
}

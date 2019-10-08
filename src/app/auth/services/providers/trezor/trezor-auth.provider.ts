import { AuthProvider } from "../../auth-provider";
import { Observable, of, throwError } from "rxjs";
import { Account, CoinType } from "@trustwallet/types";
import { CoinNotSupportedException } from "../../coin-not-supported-exception";
import { Injectable } from "@angular/core";
import { AuthModule } from "../../../auth.module";

@Injectable({ providedIn: AuthModule })
export class TrezorAuthProvider implements AuthProvider {
  getAddress(coin: CoinType): Observable<string> {
    return throwError(new CoinNotSupportedException(coin));
  }

  authorize(): Observable<Account[]> {
    return of(null);
  }

  isAuthorized(): Observable<boolean> {
    return of(false);
  }

  get name(): string {
    return "Trezor";
  }

  get id(): string {
    return "trezor";
  }

  get icon(): string {
    return "icon_trezor.svg";
  }

  get active(): boolean {
    return false;
  }

  get description() {
    return "Coming soon";
  }

  signTransaction(network: CoinType, transaction: any): Observable<string> {
    return of(null);
  }

  disconnected(): Observable<boolean> {
    return of(false);
  }
}

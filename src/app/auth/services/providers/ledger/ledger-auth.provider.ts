import { AuthProvider } from "../../auth-provider";
import { from, Observable, of, throwError, timer } from "rxjs";
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
export class LedgerAuthProvider implements AuthProvider {
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
    return "Ledger";
  }

  get id(): string {
    return "ledger";
  }

  get icon(): string {
    return "icon_ledger.svg";
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

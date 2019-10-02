import { AuthProvider } from "../../auth-provider";
import { Observable, ReplaySubject } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { Account, CoinType } from "@trustwallet/types";
import { CoinNotSupportedException } from "../../coin-not-supported-exception";
import { Injectable } from "@angular/core";
import { AuthModule } from "../../../auth.module";
import { DbService } from "../../../../shared/services/db.service";
import { WalletConnectService } from "./wallet-connect.service";

@Injectable({ providedIn: AuthModule })
export class WalletConnectAuthProvider implements AuthProvider {
  private authorized: ReplaySubject<Account[]> = new ReplaySubject(1);

  constructor(
    private readonly db: DbService,
    private wc: WalletConnectService
  ) {
    this.getDataFromDB().subscribe(
      data => {
        if (data) {
          this.authorized.next(data.items);
        } else {
          this.authorized.next(null);
        }
      },
      error => {
        this.authorized.next(null);
      }
    );
  }

  getAddress(coin: CoinType): Observable<string> {
    return this.getDataFromDB().pipe(
      map((accounts: any) => {
        let account;
        if (accounts) {
          for (const acc of accounts.items) {
            if (acc.network === coin) {
              account = acc;
            }
          }
        }
        if (!account) {
          throw new CoinNotSupportedException(coin);
        }
        return account.address;
      })
    );
  }

  authorize(): Observable<Account[]> {
    return this.wc.connect().pipe(
      tap((accounts: any) => {
        this.authorized.next(accounts);
      }),
      switchMap(_ => this.authorized)
    );
  }

  isAuthorized(): Observable<boolean> {
    return this.authorized.pipe(map(data => !!data));
  }

  private getDataFromDB(): Observable<any> {
    return this.db.get(this.id);
  }

  signTransaction(network: CoinType, transaction: any): Observable<string> {
    return this.wc.signTransaction(network, transaction);
  }

  get name(): string {
    return "Wallet Connect";
  }

  get id(): string {
    return "walletconnect";
  }

  get icon(): string {
    return "icon_walletconnect.svg";
  }

  get active(): boolean {
    return true;
  }

  disconnected(): Observable<boolean> {
    return this.wc.disconnected();
  }
}

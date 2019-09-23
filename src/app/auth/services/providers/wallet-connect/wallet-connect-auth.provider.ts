import { AuthProvider } from "../../auth-provider";
import {
  BehaviorSubject,
  from,
  Observable,
  of,
  ReplaySubject,
  throwError
} from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { Account, CoinType } from "@trustwallet/types";
import { CoinNotSupportedException } from "../../coin-not-supported-exception";
import { Injectable } from "@angular/core";
import { AuthModule } from "../../../auth.module";
import { DbService } from "../../../../shared/services/db.service";
import { WalletConnectService } from "./wallet-connect.service";

@Injectable({ providedIn: AuthModule })
export class WalletConnectAuthProvider implements AuthProvider {
  private authorized: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private readonly db: DbService,
    private wc: WalletConnectService
  ) {
    this.getDataFromDB().subscribe(
      data => {
        if (data) {
          this.authorized.next(true);
        } else {
          this.authorized.next(false);
        }
      },
      error => {
        this.authorized.next(false);
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

  authorize(): Observable<boolean> {
    return this.wc.connect().pipe(
      switchMap(accounts =>
        this.db.put(this.id, {
          items: accounts
        })
      ),
      tap(_ => {
        this.authorized.next(true);
      }),
      switchMap(_ => this.authorized)
    );
  }

  isAuthorized(): Observable<boolean> {
    return this.authorized;
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
}

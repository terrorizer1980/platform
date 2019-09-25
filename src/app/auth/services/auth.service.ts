import { Injectable } from "@angular/core";
import { combineLatest, forkJoin, Observable, of } from "rxjs";
import { AuthModule } from "../auth.module";
import { CoinType, Account } from "@trustwallet/types";
import { TrustAuthProvider } from "./providers/trust/trust-auth.provider";
import { AuthProvider } from "./auth-provider";
import { catchError, first, map, switchMap } from "rxjs/operators";
import { WalletConnectAuthProvider } from "./providers/wallet-connect/wallet-connect-auth.provider";
import { CoinNotSupportedException } from "./coin-not-supported-exception";
import { DbService } from "../../shared/services/db.service";
import { TrustDeepLinkAuthProvider } from "./providers/trust-deep-link/trust-deep-link-auth.provider";
import { LedgerAuthProvider } from "./providers/ledger/ledger-auth.provider";
import { TrezorAuthProvider } from "./providers/trezor/trezor-auth.provider";

@Injectable({ providedIn: AuthModule })
export class AuthService {
  constructor(
    private trustAuth: TrustAuthProvider,
    private walletConnectAuth: WalletConnectAuthProvider,
    private trustDeepLinkAuthProvider: TrustDeepLinkAuthProvider,
    private ledgerAuthProvider: LedgerAuthProvider,
    private trezorAuthProvider: TrezorAuthProvider,
    private db: DbService
  ) {}

  // Returns address from the first authorized provider
  getAddressFromAuthorized(coin: CoinType): Observable<string> {
    return forkJoin(
      this.getProviders().map(provider =>
        provider.getAddress(coin).pipe(
          catchError(_ => of(null)),
          first()
        )
      )
    ).pipe(
      map(results => results.filter(result => result !== null)),
      map(results => {
        if (!results.length) {
          throw new CoinNotSupportedException(coin);
        } else {
          return results[0];
        }
      })
    );
  }

  getAuthorizedProvider(coin?: CoinType): Observable<AuthProvider> {
    return forkJoin(
      this.getProviders().map(provider =>
        coin
          ? provider.getAddress(coin).pipe(
              map(() => provider),
              catchError(_ => of(null)),
              first()
            )
          : provider.isAuthorized().pipe(
              map(authorized => (authorized ? provider : null)),
              first()
            )
      )
    ).pipe(
      map(results => results.filter(result => result)),
      map(results => {
        if (!results.length) {
          throw new CoinNotSupportedException(coin);
        } else {
          return results[0];
        }
      })
    );
  }

  hasProvider(coin: CoinType): Observable<boolean> {
    return this.getAddressFromAuthorized(coin).pipe(
      map(_ => true),
      catchError(_ => of(false))
    );
  }

  signTransaction(network: CoinType, transaction: any): Observable<string> {
    return this.getAuthorizedProvider(network).pipe(
      switchMap(provider => provider.signTransaction(network, transaction))
    );
  }

  authorizeAndGetAddress(
    provider: AuthProvider,
    coin: CoinType
  ): Observable<string> {
    return this.authorize(provider).pipe(
      switchMap(_ => provider.getAddress(coin))
    );
  }

  authorize(provider: AuthProvider): Observable<Account[]> {
    return provider.authorize().pipe(
      switchMap(accounts =>
        combineLatest([
          of(accounts),
          this.db.put(provider.id, {
            items: accounts
          })
        ])
      ),
      map(([accounts]) => accounts)
    );
  }

  getUnauthorized(): Observable<AuthProvider[]> {
    return forkJoin(
      this.getProviders().map(provider => provider.isAuthorized().pipe(first()))
    ).pipe(
      map(results => {
        return results
          .map((result, index) => (!result ? this.getProviders()[index] : null))
          .filter(result => result !== null);
      })
    );
  }

  public getProviders(): AuthProvider[] {
    return [
      this.trustAuth,
      this.walletConnectAuth,
      this.trustDeepLinkAuthProvider,
      this.ledgerAuthProvider,
      this.trezorAuthProvider
    ] as AuthProvider[];
  }
}

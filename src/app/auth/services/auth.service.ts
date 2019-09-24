import { Injectable } from "@angular/core";
import { forkJoin, Observable, of } from "rxjs";
import { AuthModule } from "../auth.module";
import { CoinType, Account } from "@trustwallet/types";
import { TrustAuthProvider } from "./providers/trust/trust-auth.provider";
import { AuthProvider } from "./auth-provider";
import { catchError, first, map, switchMap } from "rxjs/operators";
import { WalletConnectAuthProvider } from "./providers/wallet-connect/wallet-connect-auth.provider";
import { CoinNotSupportedException } from "./coin-not-supported-exception";

@Injectable({ providedIn: AuthModule })
export class AuthService {
  constructor(
    private trustAuth: TrustAuthProvider,
    private walletConnectAuth: WalletConnectAuthProvider
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

  getAuthorizedProvider(coin: CoinType): Observable<AuthProvider> {
    return forkJoin(
      this.getProviders().map(provider =>
        provider.getAddress(coin).pipe(
          map(() => provider),
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

  // Authorize
  authorizeAndGetAddress(
    provider: AuthProvider,
    coin: CoinType
  ): Observable<string> {
    return provider.authorize().pipe(switchMap(_ => provider.getAddress(coin)));
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
    return [this.trustAuth, this.walletConnectAuth] as AuthProvider[];
  }
}

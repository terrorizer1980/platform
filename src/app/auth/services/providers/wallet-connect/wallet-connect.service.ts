import { Injectable } from "@angular/core";
import { AuthModule } from "../../../auth.module";
import WalletConnect from "@trustwallet/walletconnect";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";
import { environment } from "../../../../../environments/environment";
import { fromPromise } from "rxjs/internal-compatibility";
import { from, Observable, Subject } from "rxjs";
import { catchError, switchMap, tap, timeout } from "rxjs/operators";
import { CoinType } from "@trustwallet/types";
import { Errors } from "../../../../shared/consts";

@Injectable({ providedIn: AuthModule })
export class WalletConnectService {
  private connector: WalletConnect;

  constructor() {
    this.connector = new WalletConnect({
      bridge: environment.walletConnectBridge
    });
  }

  connect(reinit: boolean = false): Observable<Account[]> {
    let result: Observable<Account[]>;
    if (!this.connector || !this.connector.connected || reinit) {
      // Initialize connector with cached session and killed it as it no longer used
      this.connector = new WalletConnect({
        bridge: environment.walletConnectBridge
      });

      result = (fromPromise(this.connector.killSession()).pipe(
        tap(_ => {
          // create new instance of connector
          this.connector = new WalletConnect({
            bridge: environment.walletConnectBridge
          });
        }),
        switchMap(() => fromPromise(this.connector.createSession())),
        switchMap(() => {
          const result = new Subject();
          const uri = this.connector.uri;
          console.log(uri);
          let ignoreClose = false;
          // display QR Code modal
          WalletConnectQRCodeModal.open(uri, () => {
            if (!ignoreClose) {
              result.error(Errors.REJECTED_BY_USER);
            }
          });
          this.connector.on("connect", (error, payload) => {
            if (error) {
              result.error(error);
            }

            ignoreClose = true;

            // Close QR Code Modal
            WalletConnectQRCodeModal.close();

            result.next(true);
          });
          return result;
        }),
        switchMap(() => fromPromise(this.connector.getAccounts()))
      ) as unknown) as Observable<Account[]>;
    } else {
      result = ((fromPromise(
        this.connector.getAccounts()
      ) as unknown) as Observable<Account[]>).pipe(
        timeout(1000),
        catchError(error => this.connect(true))
      );
    }

    this.connector.on("disconnect", (error, payload) => {});

    return result;
  }

  signTransaction(network: CoinType, transaction: any): Observable<string> {
    return this.connect().pipe(
      switchMap(() =>
        from(this.connector.trustSignTransaction(network, transaction))
      )
    );
  }

  public disconnected(): Observable<boolean> {
    const result = new Subject<boolean>();
    if (this.connector) {
      this.connector.on("disconnect", (error, payload) => {
        if (!error) {
          result.next(true);
        } else {
          console.log(error);
        }
      });
    } else {
      result.next(true);
    }
    return result;
  }
}

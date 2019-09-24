import { Injectable } from "@angular/core";
import { AuthModule } from "../../../auth.module";
import WalletConnect from "@trustwallet/walletconnect";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";
import { environment } from "../../../../../environments/environment";
import { fromPromise } from "rxjs/internal-compatibility";
import { from, Observable, ReplaySubject, Subject } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { CoinType } from "@trustwallet/types";

@Injectable({ providedIn: AuthModule })
export class WalletConnectService {
  private connector: WalletConnect;

  constructor() {}

  connect(): Observable<Account[]> {
    this.connector = new WalletConnect({
      bridge: environment.walletConnectBridge
    });

    return (fromPromise(this.connector.killSession()).pipe(
      switchMap(() => fromPromise(this.connector.createSession())),
      switchMap(() => {
        const result = new Subject();
        const uri = this.connector.uri;
        // display QR Code modal
        WalletConnectQRCodeModal.open(uri, () => {
          result.error("rejectedByUser");
        });
        this.connector.on("connect", (error, payload) => {
          if (error) {
            result.error(error);
          }

          // Close QR Code Modal
          WalletConnectQRCodeModal.close();

          result.next(true);
        });
        return result;
      }),
      switchMap(() => fromPromise(this.connector.getAccounts()))
    ) as unknown) as Observable<Account[]>;
  }

  signTransaction(network: CoinType, transaction: any): Observable<string> {
    if (!this.connector) {
      return this.connect().pipe(
        switchMap(() =>
          from(this.connector.trustSignTransaction(network, transaction))
        )
      );
    } else {
      return from(this.connector.trustSignTransaction(network, transaction));
    }
  }
}

import { Injectable } from "@angular/core";
import WalletConnect from "@trustwallet/walletconnect";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";
import { environment } from "../../../../../environments/environment";
import { from, Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import { Account, CoinType } from "@trustwallet/types";
import { Errors } from "../../../../shared/consts";
import { AuthModule } from "../../../auth.module";

@Injectable({ providedIn: AuthModule })
export class WalletConnectService {
  private connector: WalletConnect;

  constructor() {}

  connect(): Observable<boolean> {
    // TODO: connector is always undefined. How do we set it as a singleton?
    if (!this.connector || !this.connector.connected) {
      this.connector = new WalletConnect({
        bridge: environment.walletConnectBridge
      });
    }

    return from(this.connector.killSession()).pipe(
      switchMap(() => from(this.connector.createSession())),
      switchMap(() => new Observable<boolean>(subs => {
        const uri = this.connector.uri;
        let ignoreClose = false;
        // display QR Code modal
        WalletConnectQRCodeModal.open(uri, () => {
          if (!ignoreClose) {
            subs.error(Errors.REJECTED_BY_USER);
          }
        });

        this.connector.on("connect", (error, _) => {
            if (error) {
            subs.error(error);
          }

          ignoreClose = true;

          // Close QR Code Modal
          WalletConnectQRCodeModal.close();

          subs.next(true);
        });
      }))
    );
  }

  getAccounts(): Observable<Account[]> {
    return this.connect().pipe(
      switchMap(() => from(this.connector.getAccounts()))
    );
  }

  signTransaction(network: CoinType, transaction: any): Observable<string> {
    return this.connect().pipe(
      switchMap(() =>
        from(this.connector.trustSignTransaction(network, transaction))
      )
    );
  }
}

import {Injectable} from "@angular/core";
import {from, interval, Observable} from "rxjs";
import {filter, map, shareReplay, switchMap, take} from "rxjs/operators";
import {TrustProvider} from "@trustwallet/provider";

@Injectable({
  providedIn: "root",
})
export class TrustProviderService {
  // TODO: use trustwallet types without hardcoding
  readonly network = 118;
  currentAccount$ : Observable<string>;

  constructor() {
    if (TrustProvider.isAvailable) {
      this.currentAccount$ = this.getAddressOnce(this.network).pipe(
        shareReplay(1),
      );
      this.currentAccount$.subscribe();
    }
  }


  // TODO: remove
  transactionSign(
    message : string,
    coin : number,
    addressTo : string,
    addressFrom : string,
    amount : string,
    sequence : string,
    accountNumber : string ) : Observable<string> {

    let network = coin;
    let transaction;

    if (message == "stake") {
      transaction = {
        typePrefix: "auth/StdTx",
        accountNumber: accountNumber,
        chainId: "cosmoshub-2",
        fee: {
          amounts: [
            {
              denom: "uatom",
              amount: "5000",
            },
          ],
          gas: "200000",
        },
        sequence: sequence,
        stakeMessage: {
          delegatorAddress: addressFrom,
          validatorAddress: addressTo,
          amount: {
            denom: "uatom",
            amount: amount,
          },
        },
      };
    } else if (message == "unstake") {
      transaction = {
        typePrefix: "auth/StdTx",
        accountNumber: accountNumber,
        chainId: "cosmoshub-2",
        fee: {
          amounts: [
            {
              denom: "uatom",
              amount: "5000",
            },
          ],
          gas: "200000",
        },
        sequence: sequence,
        unstakeMessage: {
          delegatorAddress: addressFrom,
          validatorAddress: addressTo,
          amount: {
            denom: "uatom",
            amount: amount,
          },
        },
      };
    }
    // @ts-ignore
    return TrustProvider.signTransaction(network, transaction);
  }


  getAddressOnce( network : number ) : Observable<string> {

    return from(TrustProvider.getAccounts()).pipe(
      map(( accounts : any ) => {
        const accountRaw = accounts.find(( account ) => account.network === network);
        // @ts-ignore
        alert(JSON.stringify(accountRaw.address));
        // @ts-ignore
        return JSON.stringify(accountRaw.address)
          .replace("\"", "")
          .replace("\"", "");
      }),
    );
  }
}

import { Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import { CosmosAccount } from "@trustwallet/rpc/lib";
import { Account, CoinType } from "@trustwallet/types";
import { TrustProvider } from "@trustwallet/provider/lib";

export type stakeOrUntake = "stake" | "unstake";

@Injectable({
  providedIn: "root"
})
export class TrustProviderService {
  getTxPayload(addressFrom: string, addressTo: string, amount: number): any {
    return {
      delegatorAddress: addressFrom,
      validatorAddress: addressTo,
      amount: {
        denom: "uatom",
        amount: amount
      }
    };
  }

  getCosmosTxSkeleton(account: CosmosAccount): any {
    return {
      typePrefix: "auth/StdTx",
      accountNumber: account.accountNumber,
      sequence: account.sequence,
      chainId: "cosmoshub-2",
      fee: {
        amounts: [
          {
            denom: "uatom",
            amount: "5000"
          }
        ],
        gas: "200000"
      }
    };
  }

  signCosmosStakeAction(
    action: stakeOrUntake,
    account: CosmosAccount,
    addressTo: string,
    amount
  ): Observable<string> {
    const txSkeleton = this.getCosmosTxSkeleton(account);
    const payload = this.getTxPayload(
      account.address,
      addressTo,
      amount.toString()
    );

    const tx = {
      ...txSkeleton,
      [action === "stake" ? "stakeMessage" : "unstakeMessage"]: {
        ...payload
      }
    };

    return from(TrustProvider.signTransaction(CoinType.cosmos, tx));
  }
}

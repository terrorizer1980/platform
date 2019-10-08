import { Observable } from "rxjs";
import { Account, CoinType } from "@trustwallet/types";

export interface AuthProvider {
  getAddress(coin: CoinType): Observable<string>;
  authorize(): Observable<Account[]>;
  isAuthorized(): Observable<boolean>;
  signTransaction(network: number, transaction: any): Observable<string>;
  disconnected(): Observable<boolean>;
  name: string;
  description?: string;
  active: boolean;
  id: string;
  icon: string;
}

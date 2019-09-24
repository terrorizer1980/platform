import { Observable } from "rxjs";
import { CoinType } from "@trustwallet/types";

export interface AuthProvider {
  getAddress(coin: CoinType): Observable<string>;
  authorize(): Observable<boolean>;
  isAuthorized(): Observable<boolean>;
  signTransaction(network: number, transaction: any): Observable<string>;
  name: string;
  id: string;
}

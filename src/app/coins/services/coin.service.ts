// Interface should be implemented by each coin provider
import { Observable } from "rxjs";
import { StakeHolderList } from "../coin-provider-config";
import BigNumber from "bignumber.js";

export interface CoinService {
  getAnnualPercent(): Observable<number>;
  getBalanceUSD(): Observable<BigNumber>;
  getStakedUSD(): Observable<BigNumber>;
  getStakeHolders(): Observable<StakeHolderList>;
  getPriceUSD(): Observable<BigNumber>;
}

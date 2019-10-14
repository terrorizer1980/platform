import { CoinType } from "@trustwallet/types";

export interface ValidatorRequest {
  coin: CoinType;
  address: string;
}

import { CoinType, CoinTypeUtils } from "@trustwallet/types";

export class CoinNotSupportedException {
  message: string;
  constructor(private coin: CoinType) {
    this.message = `Coin ${CoinTypeUtils.networkName(coin)} not supported`;
  }
}

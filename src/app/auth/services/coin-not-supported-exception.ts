import { CoinType, CoinTypeUtils } from "@trustwallet/types";

export class CoinNotSupportedException {
  message: string;
  code: string;
  constructor(private coin: CoinType) {
    this.message = `Coin ${CoinTypeUtils.networkName(coin)} not supported`;
    this.code = "wallet_coin_not_supported";
  }
}

import { CoinType, CoinTypeUtils } from "@trustwallet/types";

export const environment = {
  production: true,
  rpcEndpoint: (coin: CoinType) =>
    `https://${CoinTypeUtils.id(coin)}-rpc.trustwalletapp.com`,
  blockatlasEndpoint: "https://blockatlas.trustwalletapp.com"
};

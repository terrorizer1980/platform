import { CoinType, CoinTypeUtils } from "@trustwallet/types";

export const environment = {
  production: true,
  dbName: "trustwallet",
  walletConnectBridge: "https://bridge.walletconnect.org",
  rpcEndpoint: (coin: CoinType) =>
    `https://${CoinTypeUtils.id(coin)}-rpc.trustwalletapp.com`,
  blockatlasEndpoint: "https://blockatlas.trustwallet.com"
};

import { CoinDescriptor, CoinProviderConfig } from "./coin-provider-config";
import { CoinType, CoinTypeUtils } from "@trustwallet/types";
import { environment } from "../../environments/environment";
import {
  CosmosChainId,
  CosmosCoinConfig,
  CosmosProviderConfig
} from "./providers/cosmos/cosmos.descriptor";
import {
  TronChainId,
  TronCoinConfig,
  TronProviderConfig
} from "./providers/tron/tron.descriptor";
import BigNumber from "bignumber.js";

export const Coins: CoinProviderConfig[] = [
  CoinDescriptor<CosmosProviderConfig>({
    network: CoinTypeUtils.id(CoinType.cosmos),
    coin: CoinType.cosmos,
    chainId: CosmosChainId,
    endpoint: environment.rpcEndpoint(CoinType.cosmos),
    currencyName: CoinTypeUtils.networkName(CoinType.cosmos),
    currencySymbol: CoinTypeUtils.symbol(CoinType.cosmos),
    iconUri: `https://assets.trustwalletapp.com/blockchains/${CoinTypeUtils.id(
      CoinType.cosmos
    )}/info/logo.png`,
    config: CosmosCoinConfig,
    gas: new BigNumber(250000),
    fee: new BigNumber(1000),
    digits: 6
  })
];
if (!environment.production) {
  Coins.push(
    CoinDescriptor<TronProviderConfig>({
      network: CoinTypeUtils.id(CoinType.tron),
      coin: CoinType.tron,
      chainId: TronChainId,
      endpoint: environment.rpcEndpoint(CoinType.tron),
      currencyName: CoinTypeUtils.networkName(CoinType.tron),
      currencySymbol: CoinTypeUtils.symbol(CoinType.tron),
      iconUri: `https://assets.trustwalletapp.com/blockchains/${CoinTypeUtils.id(
        CoinType.tron
      )}/info/logo.png`,
      config: TronCoinConfig,
      gas: new BigNumber(0),
      fee: new BigNumber(0),
      digits: 6
    })
  );
}

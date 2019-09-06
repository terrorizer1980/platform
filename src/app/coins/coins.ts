import { CoinDescriptor, CoinProviderConfig } from "./coin-provider-config";
import { Account, CoinType } from "@trustwallet/types";
import { environment } from "../../environments/environment";
import {
  CosmosCoinConfig,
  CosmosProviderConfig
} from "./provicers/comos/cosmos.descriptor";

export const Coins: CoinProviderConfig[] = [
  CoinDescriptor<CosmosProviderConfig>({
    network: "cosmos",
    coin: CoinType.cosmos,
    chainId: "cosmoshub-2",
    endpoint: environment.cosmosEndpoint,
    currencyName: "Cosmos",
    currencySymbol: "ATOM",
    iconUri:
      "https://assets.trustwalletapp.com/blockchains/cosmos/info/logo.png",
    config: CosmosCoinConfig
  })
];

import {
  CoinDescriptor,
  CoinProviderConfig,
  UnitConverter
} from "./coin-provider-config";
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
import { TezosCoinConfig, TezosProviderConfig } from "./providers/tezos/tezos.descriptor";

function icon(type: CoinType): string {
  return `https://assets.trustwalletapp.com/blockchains/${CoinTypeUtils.id(
    type
  )}/info/logo.png`;
}

export const Coins: CoinProviderConfig[] = [
  CoinDescriptor<CosmosProviderConfig>({
    network: CoinTypeUtils.id(CoinType.cosmos),
    coin: CoinType.cosmos,
    chainId: CosmosChainId,
    endpoint: environment.rpcEndpoint(CoinType.cosmos),
    currencyName: CoinTypeUtils.networkName(CoinType.cosmos),
    currencySymbol: CoinTypeUtils.symbol(CoinType.cosmos),
    iconUri: icon(CoinType.cosmos),
    config: CosmosCoinConfig,
    gas: new BigNumber(250000),
    fee: new BigNumber(1000),
    digits: 6,
    toUnits(amount: BigNumber): BigNumber {
      return new UnitConverter(this).toUnits(amount);
    },
    toCoin(amount: BigNumber): BigNumber {
      return new UnitConverter(this).toCoin(amount);
    }
  }),
  CoinDescriptor<TronProviderConfig>({
    network: CoinTypeUtils.id(CoinType.tron),
    coin: CoinType.tron,
    chainId: TronChainId,
    endpoint: environment.rpcEndpoint(CoinType.tron),
    currencyName: CoinTypeUtils.networkName(CoinType.tron),
    currencySymbol: CoinTypeUtils.symbol(CoinType.tron),
    iconUri: icon(CoinType.tron),
    config: TronCoinConfig,
    gas: new BigNumber(0),
    fee: new BigNumber(0),
    digits: 6,
    toUnits(amount: BigNumber): BigNumber {
      return new UnitConverter(this).toUnits(amount);
    },
    toCoin(amount: BigNumber): BigNumber {
      return new UnitConverter(this).toCoin(amount);
    }
  }),
  CoinDescriptor<TezosProviderConfig>({
    network: CoinTypeUtils.id(CoinType.tezos),
    coin: CoinType.tezos,
    chainId: TronChainId,
    endpoint: environment.rpcEndpoint(CoinType.tezos),
    currencyName: CoinTypeUtils.networkName(CoinType.tezos),
    currencySymbol: CoinTypeUtils.symbol(CoinType.tezos),
    iconUri: icon(CoinType.tezos),
    config: TezosCoinConfig,
    gas: new BigNumber(11000),
    fee: new BigNumber(1300),
    digits: 6,
    toUnits(amount: BigNumber): BigNumber {
      return new UnitConverter(this).toUnits(amount);
    },
    toCoin(amount: BigNumber): BigNumber {
      return new UnitConverter(this).toCoin(amount);
    }
  })
];

export interface UpcomingCoin {
  symbol: string;
  name: string;
  iconUri: string;
  message: string;
}

export const Upcoming: UpcomingCoin[] = [
  {
    symbol: "WAV",
    name: "Waves",
    iconUri: icon(CoinType.waves),
    message: "Coming soon"
  },
  {
    symbol: "IOTX",
    name: "IoTeX",
    iconUri: icon(CoinType.iotex),
    message: "Coming soon"
  },
  {
    symbol: "",
    name: "Compound",
    iconUri: "/assets/images/icon_compound.svg",
    message: "Coming soon"
  }
];

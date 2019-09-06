import { CoinConfig, CoinProviderConfig } from "../../coin-provider-config";
import {
  CosmosService,
  CosmosServiceInjectable
} from "./services/cosmos.service";
import { CosmosConfigService } from "./services/cosmos-config.service";

const CosmosModuleLoader = () =>
  import("./cosmos-provider.module").then(mod => mod.CosmosProviderModule);

export const CosmosCoinConfig: CoinConfig<CosmosService> = {
  loader: CosmosModuleLoader,
  injectClass: CosmosService,
  configToken: CosmosConfigService,
  deps: CosmosServiceInjectable
};

export interface CosmosProviderConfig
  extends CoinProviderConfig<CosmosService> {
  endpoint: string;
  chainId: string;
}

import { CoinConfig, CoinProviderConfig } from "../../coin-provider-config";
import { CosmosService, CosmosServiceInjectable } from "./services/cosmos.service";
import { CosmosConfigService } from "./services/cosmos-config.service";
import { CosmosProviderModule } from "./cosmos-provider.module";
import { Type } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";

export function CosmosModuleLoader(): Promise<Type<CosmosProviderModule>> {
  return import("./cosmos-provider.module").then(
    mod => mod.CosmosProviderModule
  );
}

export const CosmosCoinConfig: CoinConfig<CosmosService> = {
  loader: CosmosModuleLoader,
  injectClass: CosmosService,
  configToken: CosmosConfigService,
  deps: CosmosServiceInjectable
};

export function CosmosChainId(
  http: HttpClient,
  endpoint: string
): Observable<string> {
  return http.get(`${endpoint}/node_info`).pipe(map((res: any) => res.network));
}

export interface CosmosProviderConfig
  extends CoinProviderConfig<CosmosService> {
  endpoint: string;
  chainId: (http: HttpClient, endpoint: string) => Observable<string>;
}

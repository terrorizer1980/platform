import { CoinConfig, CoinProviderConfig } from "../../coin-provider-config";
import { Type } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { TezosProviderModule } from "./tezos-provider.module";
import { TezosService, TezosServiceInjectable } from "./services/tezos.service";
import { TezosConfigService } from "./services/tezos-config.service";

export function TezosModuleLoader(): Promise<Type<TezosProviderModule>> {
  return import("./tezos-provider.module").then(mod => mod.TezosProviderModule);
}

export const TezosCoinConfig: CoinConfig<TezosService> = {
  loader: TezosModuleLoader,
  injectClass: TezosService,
  configToken: TezosConfigService,
  deps: TezosServiceInjectable
};

export interface TezosProviderConfig extends CoinProviderConfig<TezosService> {
  endpoint: string;
  chainId: (http: HttpClient, endpoint: string) => Observable<string>;
}

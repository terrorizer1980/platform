import { CoinConfig, CoinProviderConfig } from "../../coin-provider-config";
import { Type } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { TronProviderModule } from "./tron-provider.module";
import { TronService, TronServiceInjectable } from "./services/tron.service";
import { TronConfigService } from "./services/tron-config.service";

export function TronModuleLoader(): Promise<Type<TronProviderModule>> {
  return import("./tron-provider.module").then(mod => mod.TronProviderModule);
}

export const TronCoinConfig: CoinConfig<TronService> = {
  loader: TronModuleLoader,
  injectClass: TronService,
  configToken: TronConfigService,
  deps: TronServiceInjectable
};

export function TronChainId(
  http: HttpClient,
  endpoint: string
): Observable<string> {
  return http.get(`${endpoint}/node_info`).pipe(map((res: any) => res.network));
}

export interface TronProviderConfig extends CoinProviderConfig<TronService> {
  endpoint: string;
  chainId: (http: HttpClient, endpoint: string) => Observable<string>;
}

/**
 * This is not a real service, but it looks like it from the outside.
 * It's just an InjectionTToken used to import the config object, provided from the outside
 */
import { InjectionToken } from "@angular/core";
import { TezosProviderConfig } from "../tezos.descriptor";

export const TezosConfigService = new InjectionToken<TezosProviderConfig>(
  "TezosProviderConfig"
);

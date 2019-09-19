/**
 * This is not a real service, but it looks like it from the outside.
 * It's just an InjectionTToken used to import the config object, provided from the outside
 */
import { InjectionToken } from "@angular/core";
import { TronProviderConfig } from "../tron.descriptor";

export const TronConfigService = new InjectionToken<TronProviderConfig>(
  "TronProviderConfig"
);

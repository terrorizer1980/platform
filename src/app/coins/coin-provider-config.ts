import { InjectionToken, Type } from "@angular/core";
import { ClassType } from "class-transformer/ClassTransformer";
import { BlockatlasValidator } from "@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator";
import { CoinType } from "@trustwallet/types";
import BigNumber from "bignumber.js";

export enum StakeAction {
  STAKE,
  UNSTAKE
}

export type CoinConfig<T> = CoinProviderModuleLoader &
  CoinProviderInjectConfig<T>;

export interface CoinProviderConfig<T = any> {
  network: string;
  coin: CoinType;
  currencyName: string;
  currencySymbol: string;
  iconUri: string;
  config: CoinConfig<T>;
}

export interface CoinProviderModuleLoader {
  loader(): Promise<Type<any>>;
}

export interface CoinProviderInjectConfig<T> {
  injectClass: ClassType<T>;
  configToken: InjectionToken<CoinProviderInjectConfig<T>>;
  deps: any[];
}

export function CoinDescriptor<T>(data: T): T {
  return data;
}

export type StakeHolderList = Array<StakeHolder>;

export interface StakeHolder extends BlockatlasValidator {
  coin: CoinProviderConfig;
  amount: BigNumber;
}

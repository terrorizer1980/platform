// DTO - data transmission object
// We use interfaces in binding etc.

import BigNumber from "bignumber.js";

export interface ICoinPrice {
  price: string;
  contract: string;
  percent_change_24h: string;
}

export interface IPriceResponse {
  status: boolean;
  docs: ICoinPrice[];
  currency: string;
}

export interface Delegation {
  address: string;
  amount: BigNumber;
}

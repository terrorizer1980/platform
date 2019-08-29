// DTO - data transmission object
// We use interfaces in binding etc.

export interface IBlockchainDto {
  blockchainId: string;
  currencyName: string;
  currencySymbol: string;
  annualRate: number;
  iconUri: string;
}

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

export interface IValidatorInfo {
  name: string;
  description: string;
  image: string;
  website: string;
}

export interface IReward {
  annual: number;
}

export interface IValidator {
  id: string;
  status: boolean;
  info: IValidatorInfo;
  reward: IReward;
}

export interface IValidators {
  docs: IValidator[];
}

import { Transform, Type } from "class-transformer";
import BigNumber from "bignumber.js";
import { CoinType } from "@trustwallet/types";

export enum DelegationStatus {
  ACTIVE,
  PENDING
}

export class ValidatorInfo {
  name: string;
  description: string;
  image: string;
  website: string;
}

export class ValidatorReward {
  annual?: number;
}

export class ValidatorCoin {
  coin: CoinType;
  symbol: string;
  name: string;
  decimals: number;
}

export class ValidatorDelegator {
  id: string;
  status: boolean;
  locktime: number;
  minimum_amount: string;

  @Type(() => ValidatorInfo)
  info: ValidatorInfo;

  @Type(() => ValidatorReward)
  reward: ValidatorReward;
}

export class DelegationMetadata {
  @Type(() => Date)
  available_date: Date;
}

export class ValidatorDelegation {
  @Type(() => ValidatorDelegator)
  delegator: ValidatorDelegator;

  @Type(() => BigNumber)
  value: BigNumber;

  @Transform(status => {
    switch (status) {
      case "active":
        return DelegationStatus.ACTIVE;
      case "pending":
        return DelegationStatus.PENDING;
      default:
        return DelegationStatus.ACTIVE;
    }
  })
  status: DelegationStatus;

  @Type(() => DelegationMetadata)
  metadata: DelegationMetadata;
}

export class ValidatorModel {
  address: string;

  @Type(() => ValidatorCoin)
  coin: ValidatorCoin;

  @Type(() => ValidatorDelegation)
  delegations: ValidatorDelegation[];
}

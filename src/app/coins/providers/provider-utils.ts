import { CosmosProviderConfig } from "./cosmos/cosmos.descriptor";
import { BlockatlasValidator } from "@trustwallet/rpc/src/blockatlas/models/BlockatlasValidator";
import {
  BALANCE_REFRESH_INTERVAL,
  CoinProviderConfig,
  STAKE_REFRESH_INTERVAL,
  StakeHolderList
} from "../coin-provider-config";
import { CoinType } from "@trustwallet/types";
import { first, map, switchMap } from "rxjs/operators";
import { combineLatest, Observable, of, timer } from "rxjs";
import { CosmosDelegation } from "@trustwallet/rpc/src/cosmos/models/CosmosDelegation";
import BigNumber from "bignumber.js";
import { ClassType } from "class-transformer/ClassTransformer";
import { Injectable } from "@angular/core";
import { AuthService } from "../../auth/services/auth.service";

interface IAggregatedDelegationMap {
  [address: string]: BigNumber;
}

@Injectable({ providedIn: "root" })
export class ProviderUtils {
  constructor(private authService: AuthService) {}

  private map2List(
    config: CoinProviderConfig,
    address2stake: IAggregatedDelegationMap,
    validators: Array<BlockatlasValidator>
  ): StakeHolderList {
    return Object.keys(address2stake).map(address => {
      const validator = validators.find(v => v.id === address);
      return {
        ...validator,
        amount: config.toCoin(address2stake[address]),
        coin: config
      };
    });
  }

  private validatorsAndDelegations(
    coin: CoinType,
    validators: Observable<BlockatlasValidator[]>,
    delegations: (address: string) => Observable<any[]>
  ): any[] {
    return [
      validators,
      this.authService
        .getAddressFromAuthorized(coin)
        .pipe(switchMap(address => delegations(address)))
    ];
  }

  address2StakeMap<T>(
    config: Observable<CoinProviderConfig>,
    validators: () => Observable<BlockatlasValidator[]>,
    delegations: (address: string) => Observable<any[]>,
    delegationValidatorAddress: (delegation: T) => string,
    delegationShare: (delegation: T) => BigNumber
  ): Observable<StakeHolderList> {
    return config.pipe(
      switchMap(config =>
        combineLatest([
          ...this.validatorsAndDelegations(
            config.coin,
            validators(),
            delegations
          ),
          of(config)
        ])
      ),
      map((data: any[]) => {
        const approvedValidators: BlockatlasValidator[] = data[0];
        const myDelegations: T[] = data[1];
        const config: CoinProviderConfig = data[2];

        if (!approvedValidators || !myDelegations) {
          return [];
        }

        const addresses = approvedValidators.map(d => d.id);

        // Ignore delegations to validators that isn't in a list of approved validators
        const filteredDelegations = myDelegations.filter((delegation: T) => {
          return addresses.includes(delegationValidatorAddress(delegation));
        });

        const address2stakeMap = filteredDelegations.reduce(
          (acc: IAggregatedDelegationMap, delegation: T) => {
            const aggregatedAmount =
              acc[delegationValidatorAddress(delegation)] || new BigNumber(0);
            const sharesAmount =
              +delegationShare(delegation) || new BigNumber(0);
            acc[delegationValidatorAddress(delegation)] = aggregatedAmount.plus(
              sharesAmount
            );
            return acc;
          },
          {}
        );

        return this.map2List(config, address2stakeMap, approvedValidators);
      }),
      first()
    );
  }

  buildPipeline(milliSeconds, address: Observable<string>): Observable<string> {
    return address.pipe(
      switchMap(address => {
        return timer(0, milliSeconds).pipe(map(() => address));
      })
    );
  }

  updatableBalance(
    address: () => Observable<string>,
    balance: (address: string) => Observable<BigNumber>,
    config: Observable<CoinProviderConfig>
  ): Observable<BigNumber> {
    return this.buildPipeline(BALANCE_REFRESH_INTERVAL, address()).pipe(
      switchMap(address => {
        return combineLatest([balance(address), config]);
      }),
      map(([units, config]) => config.toCoin(units))
    );
  }

  updatableStakedAmount(
    address: () => Observable<string>,
    staked: (address: string) => Observable<BigNumber>,
    config: Observable<CoinProviderConfig>
  ): Observable<BigNumber> {
    return this.buildPipeline(STAKE_REFRESH_INTERVAL, address()).pipe(
      switchMap(address => {
        return combineLatest([staked(address), config]);
      }),
      map(([units, config]) => config.toCoin(units) || new BigNumber(0))
    );
  }

  selectValidatorWithBestInterestRate(validators: BlockatlasValidator[]) {
    return validators.reduce(
      (maxRate: number, validator: BlockatlasValidator) => {
        return maxRate < validator.reward.annual
          ? validator.reward.annual
          : maxRate;
      },
      0
    );
  }
}

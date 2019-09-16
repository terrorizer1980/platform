import { CosmosService } from "../services/cosmos.service";
import { FormControl } from "@angular/forms";
import { combineLatest, Observable, of, timer } from "rxjs";
import { first, map, switchMap } from "rxjs/operators";
import BigNumber from "bignumber.js";
import { CosmosProviderConfig } from "../cosmos.descriptor";
import { CosmosUtils } from "@trustwallet/rpc/lib";

export const StakeValidator = (
  isStake: boolean,
  config: CosmosProviderConfig,
  cosmos: CosmosService,
  validatorId: string,
  minValue: BigNumber = new BigNumber(0.001)
) => {
  return (input: FormControl) => {
    return timer(300).pipe(
      switchMap(() => {
        let obs: Observable<any>;
        if (!isStake) {
          obs = cosmos.getStakedToValidator(validatorId);
        } else {
          obs = of(0);
        }
        return combineLatest([cosmos.getBalance(), obs]);
      }),
      map(([balance, res]) => {
        if (input.value === "") {
          return null;
        }

        const val = new BigNumber(input.value);
        if (val.isLessThan(minValue) || val.isNaN()) {
          return { min: minValue.toString() };
        }

        const additional = CosmosUtils.toAtom(
          new BigNumber(config.gas + config.fee)
        );
        if (isStake && val.plus(additional).isGreaterThan(balance)) {
          return { max: balance.minus(additional).toString() };
        }
        if (!isStake && val.isGreaterThan(res)) {
          return { max: res.toString() };
        }
        if (!isStake && balance.isLessThan(additional)) {
          return { restriction: additional.toString() };
        }

        return null;
      }),
      first()
    );
  };
};

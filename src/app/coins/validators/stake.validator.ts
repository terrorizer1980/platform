import { FormControl } from "@angular/forms";
import { combineLatest, of } from "rxjs";
import { catchError, first, map, shareReplay } from "rxjs/operators";
import BigNumber from "bignumber.js";
import { CosmosUtils } from "@trustwallet/rpc/lib";
import { CoinProviderConfig } from "../coin-provider-config";
import { CoinService } from "../services/coin.service";

export const StakeValidator = (
  isStake: boolean,
  config: CoinProviderConfig,
  dataSource: CoinService,
  validatorId: string,
  minValue: BigNumber = new BigNumber(0.001)
) => {
  const data = combineLatest([
    dataSource.getBalance().pipe(catchError(_ => of(new BigNumber(Infinity)))),
    dataSource
      .getStakedToValidator(validatorId)
      .pipe(catchError(_ => of(new BigNumber(0))))
  ]).pipe(shareReplay(1));

  return (input: FormControl) => {
    return data.pipe(
      map(([balance, res]) => {
        if (input.value === "") {
          return null;
        }

        const val = new BigNumber(input.value);
        if (val.isLessThan(minValue) || val.isNaN()) {
          return { min: minValue.toString() };
        }

        const additional = CosmosUtils.toAtom(new BigNumber(config.fee));
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

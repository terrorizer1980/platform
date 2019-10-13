import { Component, Inject } from "@angular/core";
import { CosmosService } from "../../services/cosmos.service";
import { catchError, map } from "rxjs/operators";
import { CosmosConfigService } from "../../services/cosmos-config.service";
import { combineLatest, Observable, of } from "rxjs";
import { CosmosProviderConfig } from "../../cosmos.descriptor";
import { StakeHolder } from "../../../../coin-provider-config";
import BigNumber from "bignumber.js";
import { CosmosUnbond } from "@trustwallet/rpc/lib/cosmos/models/CosmosUnbond";
import { BlockatlasValidator, CosmosUtils } from "@trustwallet/rpc";
import moment from "moment";
import { ActivatedRoute, Router } from "@angular/router";

interface PendingWithdrawals {
  validator: BlockatlasValidator;
  date: string;
  balance: BigNumber;
}

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"]
})
export class DetailsComponent {
  isUnstakeEnabled = this.cosmos.isUnstakeEnabled();
  hasProvider = this.cosmos.hasProvider();
  validators: Observable<StakeHolder[]> = this.cosmos.getStakeHolders().pipe(
    map(stakeHolders => {
      return stakeHolders.map(sh => {
        sh.amount = new BigNumber(sh.amount);
        return sh;
      });
    }),
    catchError(() => of([]))
  );
  pendingWithdrawals: Observable<PendingWithdrawals[]> = combineLatest([
    this.cosmos.getStakePendingUnbonds(),
    this.cosmos.getValidators()
  ]).pipe(
    map(([unbounds, holders]) =>
      unbounds.reduce(
        (acc, unbound) => {
          const holder = holders.find(
            validator => validator.id === unbound.validator_address
          );
          return [
            ...acc,
            ...unbound.getPending().map(pending => ({
              validator: holder,
              date: `${moment
                .duration(
                  moment(pending.completionTime).diff(moment(), "minutes"),
                  "minutes"
                )
                .humanize()}`,
              balance: CosmosUtils.toAtom(pending.balance)
            }))
          ];
        },
        [] as PendingWithdrawals[]
      )
    ),
    catchError(() => of([]))
  ) as Observable<PendingWithdrawals[]>;
  additionalInfo = combineLatest([
    this.cosmos.getStakingInfo(),
    this.cosmos.getStaked().pipe(catchError(() => of(new BigNumber(0)))),
    this.config
  ]).pipe(
    map(([info, staked, config]) => [
      {
        name: "Supply Balance",
        value: `${staked.toFormat(2, BigNumber.ROUND_DOWN)} ${
          config.currencySymbol
        }`
      },
      {
        name: "Minimum Amount",
        value: 0.01
      },
      {
        name: "Withdraw Time",
        value: `${info.timeFrame.day} days`
      }
    ])
  );

  constructor(
    @Inject(CosmosConfigService)
    public config: Observable<CosmosProviderConfig>,
    public cosmos: CosmosService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  stake() {
    this.router.navigate([`stake`], { relativeTo: this.activatedRoute });
  }

  unstake() {
    this.router.navigate([`unstake`], { relativeTo: this.activatedRoute });
  }
}

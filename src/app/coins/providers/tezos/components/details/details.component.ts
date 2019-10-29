import { Component, Inject } from "@angular/core";
import { catchError, map, switchMap } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import { TezosService } from "../../services/tezos.service";
import { combineLatest, Observable, of } from "rxjs";
import { TezosConfigService } from "../../services/tezos-config.service";
import { TezosProviderConfig } from "../../tezos.descriptor";
import BigNumber from "bignumber.js";
import { StakeHolder } from "../../../../coin-provider-config";
import moment from "moment";

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"]
})
export class DetailsComponent {
  isLoading = false;
  isUnstakeEnabled = this.tezos.isUnstakeEnabled();
  hasProvider = this.tezos.hasProvider();
  validators: Observable<StakeHolder[]> = this.tezos.getStakeHolders().pipe(
    map(stakeHolders => {
      return stakeHolders.map(sh => {
        sh.amount = new BigNumber(sh.amount);
        return sh;
      });
    }),
    catchError(() => of([]))
  );
  additionalInfo = combineLatest([
    this.config.pipe(
      switchMap(config => this.tezos.getStaked().pipe(
        map(staked => config.toCoin(staked)),
        catchError(() => of(new BigNumber(0)))
      ))
    ),
    this.config
  ]).pipe(
    map(([staked, config]) => {
      console.log(`staked: ${staked}`);
      return [
        {
          name: "Supply Balance",
          value: `${staked.toFormat(2, BigNumber.ROUND_DOWN)} ${
            config.currencySymbol
          }`
        },
        {
          name: "Minimum Amount",
          value: 1
        },
        {
          name: "Withdraw Time",
          value: `No lock time`
        }
      ];
    }),
  );

  constructor(
    @Inject(TezosConfigService)
    public config: Observable<TezosProviderConfig>,
    public tezos: TezosService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  stake() {
    this.router.navigate([`stake`], { relativeTo: this.activatedRoute });
  }

  unstake() {
  }
}

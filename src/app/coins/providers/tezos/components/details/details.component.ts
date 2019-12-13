import { Component, Inject } from "@angular/core";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import { TezosService } from "../../services/tezos.service";
import { combineLatest, Observable, of } from "rxjs";
import { TezosConfigService } from "../../services/tezos-config.service";
import { TezosProviderConfig } from "../../tezos.descriptor";
import BigNumber from "bignumber.js";
import {
  CoinProviderConfig,
  StakeAction,
  StakeHolder
} from "../../../../coin-provider-config";
import { DialogsService } from "../../../../../shared/services/dialogs.service";

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"]
})
export class DetailsComponent {
  isLoading = false;
  isUnstakeEnabled = this.tezos.isUnstakeEnabled();
  hasProvider = this.tezos.hasProvider();
  balance = this.tezos.getBalanceCoins();
  insufficientBalance = combineLatest([
    this.config,
    this.tezos.getBalanceUnits()
  ]).pipe(map(([config, balance]) => balance.comparedTo(config.fee) <= 0));
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
      switchMap(config =>
        this.tezos.getStaked().pipe(
          map(staked => config.toCoin(staked)),
          catchError(() => of(new BigNumber(0)))
        )
      )
    ),
    this.balance,
    this.config
  ]).pipe(
    map(([staked, balance, config]) => {
      return [
        {
          name: "Available Balance",
          value: `${balance.toFormat(6, BigNumber.ROUND_DOWN)} ${
            config.currencySymbol
          }`
        },
        {
          name: "Staked Balance",
          value: `${staked.toFormat(6, BigNumber.ROUND_DOWN)} ${
            config.currencySymbol
          }`
        },
        {
          name: "Minimum Amount",
          value: 1
        },
        {
          name: "Lock Time",
          value: `No lock time`
        }
      ];
    })
  );

  constructor(
    @Inject(TezosConfigService)
    public config: Observable<TezosProviderConfig>,
    public tezos: TezosService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogsService
  ) {}

  stake() {
    this.router.navigate([`stake`], { relativeTo: this.activatedRoute });
  }

  unstake() {
    this.tezos
      .prepareStakeTx(StakeAction.UNSTAKE, null, null)
      .pipe(
        tap(() => (this.isLoading = false), e => (this.isLoading = false)),
        switchMap(_ => this.config)
      )
      .subscribe(cfg => {
        this.congratulate(cfg);
      });
  }

  congratulate(config: CoinProviderConfig) {
    const modalRef = this.dialogService.showSuccess(
      `You have successfully withdrawn ${config.currencySymbol}s`
    );
    modalRef.result.then(
      data => {
        this.router.navigate([`/`]);
      },
      reason => {
        this.router.navigate([`/`]);
      }
    );
  }
}

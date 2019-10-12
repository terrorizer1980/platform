import { Component, Inject } from "@angular/core";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import { TronService } from "../../services/tron.service";
import { CosmosConfigService } from "../../../cosmos/services/cosmos-config.service";
import { combineLatest, Observable, of } from "rxjs";
import { CosmosProviderConfig } from "../../../cosmos/cosmos.descriptor";
import { TronConfigService } from "../../services/tron-config.service";
import { TronProviderConfig } from "../../tron.descriptor";
import { BlockatlasValidator, TronUtils } from "@trustwallet/rpc/lib";
import BigNumber from "bignumber.js";
import {
  CoinProviderConfig,
  StakeAction,
  StakeHolder
} from "../../../../coin-provider-config";
import moment from "moment";
import { DialogsService } from "../../../../../shared/services/dialogs.service";
import { WithdrawPopupComponent } from "../withdraw-popup/withdraw-popup.component";

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"]
})
export class DetailsComponent {
  isLoading = false;

  isUnstakeEnabled = this.tron.isUnstakeEnabled();
  hasProvider = this.tron.hasProvider();
  validators: Observable<StakeHolder[]> = this.tron.getStakeHolders().pipe(
    map(stakeHolders => {
      return stakeHolders.map(sh => {
        sh.amount = new BigNumber(sh.amount);
        return sh;
      });
    }),
    catchError(() => of([]))
  );
  releaseDate = this.tron.getUnstakingDate().pipe(
    map(
      date =>
        `${moment
          .duration(moment(date).diff(moment(), "minutes"), "minutes")
          .humanize()}`
    ),
    catchError(() => {
      return of("");
    })
  );
  additionalInfo = combineLatest([
    this.tron.getStakingInfo(),
    this.tron.getStaked().pipe(
      map(staked => TronUtils.fromTron(staked)),
      catchError(() => of(new BigNumber(0)))
    ),
    this.config
  ]).pipe(
    map(([info, staked, config]) => {
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
          value: `${info.lockTime} days`
        }
      ];
    })
  );

  constructor(
    public tron: TronService,
    @Inject(TronConfigService)
    public config: Observable<TronProviderConfig>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogsService
  ) {}

  stake() {
    this.router.navigate([`stake`], { relativeTo: this.activatedRoute });
  }

  unstake(active: boolean, config: TronProviderConfig) {
    console.log(123);
    if (this.isLoading || !active) {
      return;
    }

    const dialog = this.dialogService.showModal(WithdrawPopupComponent);
    dialog.componentInstance.image = config.iconUri;
    dialog.componentInstance.confirmation.subscribe(() => {
      this.isLoading = true;

      this.tron
        .prepareStakeTx(StakeAction.UNSTAKE, null, null)
        .pipe(
          tap(() => (this.isLoading = false), e => (this.isLoading = false)),
          switchMap(_ => this.config)
        )
        .subscribe(config => {
          this.congratulate(config);
        });
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

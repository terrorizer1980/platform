import { AfterViewInit, Component, Inject, OnDestroy } from "@angular/core";
import { Observable, of, Subject, throwError, timer } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { TronProviderConfig } from "../../tron.descriptor";
import { TronConfigService } from "../../services/tron-config.service";
import { TronService } from "../../services/tron.service";
import BigNumber from "bignumber.js";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import {
  BlockatlasValidator,
  TronTransaction,
  TronUtils
} from "@trustwallet/rpc/lib";
import { StakeAction } from "../../../../coin-provider-config";
import { DialogsService } from "../../../../../shared/services/dialogs.service";
import { StakingStatusComponent } from "../staking-status/staking-status.component";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-staking",
  templateUrl: "./staking.component.html",
  styleUrls: ["./staking.component.scss"]
})
export class StakingComponent implements OnDestroy {
  stakingStatusRef: NgbModalRef;
  hasProvider = this.tron.hasProvider();
  balance = this.tron
    .getBalanceCoins()
    .pipe(catchError(_ => of(new BigNumber(0))));
  info = this.tron.getStakingInfo();
  prepareVoteTx = (
    action: StakeAction,
    addressTo: string,
    amount: BigNumber
  ): Observable<TronTransaction> => {
    this.stakingStatusRef = this.dialogsService.showModal(
      StakingStatusComponent,
      {
        backdrop: "static",
        keyboard: false
      }
    );
    return this.tron.prepareFreezeTx(amount).pipe(
      tap(() => {
        this.stakingStatusRef.componentInstance.steps[0] = true;
      }),
      switchMap(_ => this.tron.prepareStakeTx(action, addressTo, amount)),
      tap(() => {
        this.stakingStatusRef.componentInstance.steps[1] = true;
      }),
      switchMap(result => timer(300).pipe(map(() => result))),
      tap(() => {
        this.stakingStatusRef.close();
      }),
      catchError(err => {
        this.stakingStatusRef.close();
        return throwError(err);
      })
    );
  };
  price = this.tron.getPriceUSD();
  validators: Observable<
    Array<BlockatlasValidator>
  > = this.tron.getValidators();
  amount = new Subject<BigNumber>();

  constructor(
    @Inject(TronConfigService)
    public config: Observable<TronProviderConfig>,
    public tron: TronService,
    public dialogsService: DialogsService
  ) {}

  formatMax(max: BigNumber): string {
    return max.integerValue(BigNumber.ROUND_DOWN).toString();
  }

  ngOnDestroy(): void {
    if (this.stakingStatusRef) {
      this.stakingStatusRef.close();
    }
  }
}

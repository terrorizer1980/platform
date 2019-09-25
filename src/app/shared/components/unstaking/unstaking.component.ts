import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CoinService } from "../../../coins/services/coin.service";
import { Observable, Subscription } from "rxjs";
import {
  CoinProviderConfig,
  StakeAction
} from "../../../coins/coin-provider-config";
import { FormBuilder, FormGroup } from "@angular/forms";
import BigNumber from "bignumber.js";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogsService } from "../../services/dialogs.service";
import { map, shareReplay, switchMap, tap } from "rxjs/operators";
import { StakeValidator } from "../../../coins/validators/stake.validator";

@Component({
  selector: "app-shared-unstaking",
  templateUrl: "./unstaking.component.html",
  styleUrls: ["./unstaking.component.scss"]
})
export class UnstakingComponent implements OnInit, OnDestroy {
  @Input() validatorId: string;
  @Input() dataSource: CoinService;
  @Input() config: Observable<CoinProviderConfig>;
  @Input() timeFrame: Observable<number>;
  stakeForm: FormGroup;
  max$: Observable<any>;
  Math = Math;
  isLoading = false;

  confSubs: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private dialogService: DialogsService,
    private router: Router
  ) {}

  unStake() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.config
      .pipe(
        map(cfg =>
          cfg.toUnits(new BigNumber(this.stakeForm.get("amount").value))
        ),
        switchMap(amount =>
          this.dataSource.prepareStakeTx(
            StakeAction.UNSTAKE,
            this.validatorId,
            amount
          )
        ),
        tap(() => (this.isLoading = false), e => (this.isLoading = false)),
        switchMap(_ => this.config)
      )
      .subscribe(config => {
        this.congratulate(config, this.stakeForm.get("amount").value);
      });
  }

  setMax() {
    this.max$.subscribe(max => {
      this.stakeForm.get("amount").setValue(max);
    });
  }

  congratulate(config: CoinProviderConfig, sum: number) {
    const modalRef = this.dialogService.showSuccess(
      `You have successfully withdrawn ${sum} ${config.currencySymbol}s`
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

  ngOnInit(): void {
    this.max$ = this.dataSource
      .getStakedToValidator(this.validatorId)
      .pipe(shareReplay(1));
    this.confSubs = this.config.subscribe(config => {
      this.stakeForm = this.fb.group({
        amount: [
          "",
          [],
          [StakeValidator(false, config, this.dataSource, this.validatorId)]
        ]
      });
    });
  }

  ngOnDestroy(): void {
    this.confSubs.unsubscribe();
  }
}

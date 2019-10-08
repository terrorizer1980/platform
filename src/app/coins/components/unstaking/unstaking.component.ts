import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CoinService } from "../../services/coin.service";
import { combineLatest, Observable, Subscription } from "rxjs";
import { CoinProviderConfig, StakeAction } from "../../coin-provider-config";
import { FormBuilder, FormGroup } from "@angular/forms";
import BigNumber from "bignumber.js";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogsService } from "../../../shared/services/dialogs.service";
import { map, shareReplay, switchMap, tap } from "rxjs/operators";
import { StakeValidator } from "../../validators/stake.validator";
import { BlockatlasValidator } from "@trustwallet/rpc/lib";

@Component({
  selector: "app-shared-unstaking",
  templateUrl: "./unstaking.component.html",
  styleUrls: ["./unstaking.component.scss"]
})
export class UnstakingComponent implements OnInit, OnDestroy {
  @Input() config: Observable<CoinProviderConfig>;
  @Input() timeFrame: Observable<number>;
  @Input() validator: Observable<BlockatlasValidator>;
  @Input() balance: Observable<BigNumber>;
  @Input() staked: Observable<BigNumber>;
  @Input() max: number;
  @Input() prepareTx: (
    action: StakeAction,
    validatorId: string,
    amount: BigNumber
  ) => Observable<any>;
  @Input() formatMax: (max: BigNumber) => BigNumber;
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

    combineLatest([this.config, this.validator])
      .pipe(
        switchMap(([cfg, validator]) =>
          this.prepareTx(
            StakeAction.UNSTAKE,
            validator.id,
            cfg.toUnits(new BigNumber(this.stakeForm.get("amount").value))
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
    this.max$ = this.staked.pipe(shareReplay(1));
    this.confSubs = this.config.subscribe(config => {
      this.stakeForm = this.fb.group({
        amount: [
          "",
          [],
          [StakeValidator(false, config, this.balance, this.staked)]
        ]
      });
    });
  }

  ngOnDestroy(): void {
    this.confSubs.unsubscribe();
  }
}

import { Component, Inject, OnInit } from "@angular/core";
import { combineLatest, Observable } from "rxjs";
import { CosmosService } from "../../services/cosmos.service";
import { ActivatedRoute, Router } from "@angular/router";
import { StakeAction } from "../../../../coin-provider-config";
import { CosmosStakingInfo } from "@trustwallet/rpc/lib/cosmos/models/CosmosStakingInfo";
import { FormBuilder, FormGroup } from "@angular/forms";
import { StakeValidator } from "../../validators/stake.validator";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SuccessPopupComponent } from "../../../../../shared/components/success-popup/success-popup.component";
import { map, shareReplay, switchMap, tap } from "rxjs/operators";
import BigNumber from "bignumber.js";
import { DialogsService } from "../../../../../shared/services/dialogs.service";
import { CosmosConfigService } from "../../services/cosmos-config.service";
import { CosmosProviderConfig } from "../../cosmos.descriptor";
import { CosmosUtils } from "@trustwallet/rpc/lib";

@Component({
  selector: "app-test",
  templateUrl: "./staking.component.html",
  styleUrls: ["./staking.component.scss"]
})
export class StakingComponent implements OnInit {
  myAddress: Observable<string>;
  validatorId: string;
  info: Observable<CosmosStakingInfo>;
  stakeForm: FormGroup;
  max$ = this.getMax();
  warn$: Observable<BigNumber>;
  monthlyEarnings$: Observable<BigNumber>;
  Math = Math;
  isLoading = false;

  constructor(
    @Inject(CosmosConfigService)
    private config: Observable<CosmosProviderConfig>,
    private cosmos: CosmosService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private dialogService: DialogsService,
    private router: Router
  ) {
    this.myAddress = this.cosmos.getAddress();
    this.validatorId = activatedRoute.snapshot.params.validatorId;
    this.info = this.cosmos.getStakingInfo();
    this.config.subscribe(config => {
      this.stakeForm = this.fb.group({
        amount: [
          "",
          [],
          [StakeValidator(true, config, this.cosmos, this.validatorId)]
        ]
      });
    });
  }

  stake() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    const amount = new BigNumber(this.stakeForm.get("amount").value).times(
      new BigNumber(1000000)
    );

    this.cosmos
      .sendTx(StakeAction.STAKE, this.validatorId, amount)
      .pipe(tap(() => (this.isLoading = false), e => (this.isLoading = false)))
      .subscribe(_ => {
        this.congratulate(this.stakeForm.get("amount").value);
      });
  }

  setMax() {
    this.max$.subscribe(({ normal }) => {
      this.stakeForm.get("amount").setValue(normal);
    });
  }

  warn(): Observable<BigNumber> {
    return combineLatest([
      this.stakeForm.get("amount").valueChanges,
      this.max$
    ]).pipe(
      map(([value, max]) => {
        const val = new BigNumber(value);
        if (val.isGreaterThan(max.normal) && val.isLessThan(max.min)) {
          return max.normal;
        }
        return null;
      }),
      shareReplay(1)
    );
  }

  getMonthlyEarnings(): Observable<BigNumber> {
    return combineLatest([
      this.stakeForm.get("amount").valueChanges,
      this.cosmos.getValidatorFromBlockatlasById(this.validatorId)
    ]).pipe(
      map(([value, validator]) => {
        const val = new BigNumber(value);
        if (val.isNaN()) {
          return null;
        }
        return val.multipliedBy(validator.reward.annual / 100).dividedBy(12);
      }),
      shareReplay(1)
    );
  }
  getMax(): Observable<{ min: BigNumber; normal: BigNumber }> {
    return combineLatest([this.cosmos.getBalance(), this.config]).pipe(
      map(([balance, config]) => {
        const additional = CosmosUtils.toAtom(new BigNumber(config.fee));
        const normal = balance.minus(additional.multipliedBy(2));
        const min = balance.minus(additional);
        return {
          normal: normal.isGreaterThan(0) ? normal : new BigNumber(0),
          min: min.isGreaterThan(0) ? min : new BigNumber(0)
        };
      }),
      shareReplay(1)
    );
  }

  congratulate(sum: number) {
    const modalRef = this.dialogService.showSuccess(
      `You have successfully staked ${sum} ATOMs`
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
    this.warn$ = this.warn();
    this.monthlyEarnings$ = this.getMonthlyEarnings();
  }
}

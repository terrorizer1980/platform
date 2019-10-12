import {
  Component,
  ContentChild,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef
} from "@angular/core";
import { CoinService } from "../../services/coin.service";
import {
  combineLatest,
  Observable,
  of,
  ReplaySubject,
  Subject,
  Subscription
} from "rxjs";
import { CoinProviderConfig, StakeAction } from "../../coin-provider-config";
import { FormBuilder, FormGroup } from "@angular/forms";
import BigNumber from "bignumber.js";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogsService } from "../../../shared/services/dialogs.service";
import { map, shareReplay, switchMap, tap } from "rxjs/operators";
import { StakeValidator } from "../../validators/stake.validator";
import { BlockatlasValidator } from "@trustwallet/rpc/lib";
import { ContentDirective } from "../../../shared/directives/content.directive";

@Component({
  selector: "app-shared-unstaking",
  templateUrl: "./unstaking.component.html",
  styleUrls: ["./unstaking.component.scss"]
})
export class UnstakingComponent implements OnInit, OnDestroy {
  @Input() config: CoinProviderConfig;
  @Input() timeFrame: Observable<number>;
  @Input() balance: Observable<BigNumber>;
  @Input() staked: (validator: string) => Observable<BigNumber>;
  @Input() validators: Observable<Array<BlockatlasValidator>>;
  @Input() price: Observable<BigNumber>;
  @Input() max: number;
  @Input() prepareTx: (
    action: StakeAction,
    validatorId: string,
    amount: BigNumber
  ) => Observable<any>;
  @Input() formatMax: (max: BigNumber) => BigNumber;

  @ContentChild(ContentDirective, { read: TemplateRef, static: false })
  contentTemplate;

  usdAmount = new Subject();
  stakeForm: FormGroup;
  max$: Observable<any>;
  isLoading = false;

  validatorSubs: Subscription;
  priceSubs: Subscription;

  validator = new ReplaySubject<BlockatlasValidator>(1);

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private dialogService: DialogsService,
    private router: Router
  ) {
    this.stakeForm = this.fb.group({
      amount: ["", [], []]
    });
  }

  unStake(disabled: boolean) {
    if (this.isLoading || disabled) {
      return;
    }

    this.isLoading = true;

    this.validator
      .pipe(
        switchMap(validator =>
          this.prepareTx(
            StakeAction.UNSTAKE,
            validator.id,
            this.config.toUnits(
              new BigNumber(this.stakeForm.get("amount").value)
            )
          )
        ),
        tap(() => (this.isLoading = false), e => (this.isLoading = false)),
        map(_ => this.config)
      )
      .subscribe(config => {
        this.congratulate(config, this.stakeForm.get("amount").value);
      });
  }

  setMax() {
    this.max$.subscribe(max => {
      this.stakeForm.get("amount").setValue(this.formatMax(new BigNumber(max)));
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
    this.max$ = this.validator.pipe(
      switchMap(validator => this.staked(validator.id)),
      shareReplay(1)
    );

    this.validatorSubs = this.validator.subscribe(validator => {
      this.stakeForm
        .get("amount")
        .setAsyncValidators([
          StakeValidator(
            false,
            this.config,
            this.balance,
            this.staked(validator.id),
            this.max
          )
        ]);
    });

    this.priceSubs = combineLatest([
      this.stakeForm.get("amount").valueChanges,
      this.price
    ])
      .pipe(
        map(([amount, price]) => {
          const val = new BigNumber(amount);
          if (val.isNaN()) {
            return "0";
          } else {
            return val.multipliedBy(price).toFormat(2, BigNumber.ROUND_DOWN);
          }
        })
      )
      .subscribe(result => {
        this.usdAmount.next(result);
      });
  }

  selectValidator(validator: BlockatlasValidator) {
    this.validator.next(validator);
    this.stakeForm.get("amount").setValue(this.stakeForm.get("amount").value);
  }

  ngOnDestroy(): void {
    this.validatorSubs.unsubscribe();
    this.priceSubs.unsubscribe();
  }
}

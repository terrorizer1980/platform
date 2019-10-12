import {
  Component,
  ContentChild,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef
} from "@angular/core";
import {
  combineLatest,
  forkJoin,
  Observable,
  of,
  ReplaySubject,
  Subject,
  Subscription,
  throwError
} from "rxjs";
import { CosmosStakingInfo } from "@trustwallet/rpc/lib/cosmos/models/CosmosStakingInfo";
import { FormBuilder, FormGroup } from "@angular/forms";
import BigNumber from "bignumber.js";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogsService } from "../../../shared/services/dialogs.service";
import { StakeValidator } from "../../validators/stake.validator";
import { CoinProviderConfig, StakeAction } from "../../coin-provider-config";
import {
  catchError,
  first,
  map,
  shareReplay,
  switchMap,
  tap
} from "rxjs/operators";
import { BlockatlasValidator, CosmosUtils } from "@trustwallet/rpc/lib";
import { CoinService } from "../../services/coin.service";
import { DetailsValidatorInterface } from "../details/details.component";
import { AuthService } from "../../../auth/services/auth.service";
import { SelectAuthProviderComponent } from "../../../shared/components/select-auth-provider/select-auth-provider.component";
import { AuthProvider } from "../../../auth/services/auth-provider";
import { ErrorsService } from "../../../shared/services/errors/errors.service";
import { Errors } from "../../../shared/consts";
import { ContentDirective } from "../../../shared/directives/content.directive";
import { ComponentAuthService } from "../../services/component-auth.service";

export interface StakeDetails {
  hasProvider: boolean;
  price: number;
}

@Component({
  selector: "app-shared-staking",
  templateUrl: "./staking.component.html",
  styleUrls: ["./staking.component.scss"]
})
export class StakingComponent implements OnInit, OnDestroy {
  @Input() config: CoinProviderConfig;
  @Input() balance: Observable<BigNumber>;
  @Input() hasProvider: Observable<boolean>;
  @Input() info: Observable<any>;
  @Input() max: number;
  @Input() prepareTx: (
    action: StakeAction,
    validatorId: string,
    amount: BigNumber
  ) => Observable<any>;
  @Input() formatMax: (max: BigNumber) => string;
  @Input() price: Observable<BigNumber>;
  @Input() validators: Observable<Array<BlockatlasValidator>>;

  @ContentChild(ContentDirective, { read: TemplateRef, static: false })
  contentTemplate;

  validator = new ReplaySubject<BlockatlasValidator>(1);
  stakeForm: FormGroup;
  max$: Observable<any>;
  warn$: Observable<BigNumber>;
  monthlyEarnings$: Observable<BigNumber>;
  Math = Math;
  isLoading = false;
  details$: Observable<StakeDetails>;
  usdAmount = new Subject();

  confSubs: Subscription;
  priceSubs: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private dialogService: DialogsService,
    private router: Router,
    private errorsService: ErrorsService,
    private auth: AuthService,
    private componentAuthService: ComponentAuthService
  ) {
    this.stakeForm = this.fb.group({
      amount: ["", [], []]
    });
  }

  stake() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    const stake$ = this.validator.pipe(
      switchMap(validator => {
        const amount = this.config.toUnits(
          new BigNumber(this.stakeForm.get("amount").value)
        );
        return this.prepareTx(StakeAction.STAKE, validator.id, amount);
      }),
      tap(() => (this.isLoading = false), e => (this.isLoading = false)),
      map(_ => this.config)
    );

    this.details$
      .pipe(
        switchMap(({ hasProvider }) => {
          if (hasProvider) {
            return stake$;
          } else {
            return this.componentAuthService.showAuth(this.config.coin);
          }
        }),
        tap(() => (this.isLoading = false), e => (this.isLoading = false))
      )
      .subscribe(
        (result: any) => {
          this.congratulate(result, this.stakeForm.get("amount").value);
        },
        error => {
          this.errorsService.showError(error);
        }
      );
  }

  selectValidator(validator: BlockatlasValidator) {
    this.validator.next(validator);
  }

  setMax() {
    this.max$.subscribe(({ normal }) => {
      this.stakeForm.get("amount").setValue(this.formatMax(normal));
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
      this.validator
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
    return this.balance.pipe(
      map(balance => {
        const additional = this.config.toCoin(new BigNumber(this.config.fee));
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

  congratulate(config: CoinProviderConfig, sum: number) {
    const modalRef = this.dialogService.showSuccess(
      `You have successfully staked ${sum} ${config.currencySymbol}s`
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
    this.confSubs = this.validator.subscribe(validator => {
      this.stakeForm
        .get("amount")
        .setAsyncValidators([
          StakeValidator(true, this.config, this.balance, of(null), this.max)
        ]);
    });

    this.max$ = this.getMax();
    this.warn$ = this.warn();
    this.monthlyEarnings$ = this.getMonthlyEarnings();
    this.details$ = forkJoin({
      hasProvider: this.hasProvider,
      price: this.price.pipe(
        map(price => price.toNumber()),
        first()
      )
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

  ngOnDestroy(): void {
    this.confSubs.unsubscribe();
    this.priceSubs.unsubscribe();
  }
}

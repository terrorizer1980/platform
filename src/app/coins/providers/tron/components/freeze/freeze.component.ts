import {
  Component,
  ContentChild,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef
} from "@angular/core";
import {
  CoinProviderConfig,
  StakeAction
} from "../../../../coin-provider-config";
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
import BigNumber from "bignumber.js";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogsService } from "../../../../../shared/services/dialogs.service";
import { ErrorsService } from "../../../../../shared/services/errors/errors.service";
import { AuthService } from "../../../../../auth/services/auth.service";
import {
  catchError,
  first,
  map,
  shareReplay,
  switchMap,
  tap
} from "rxjs/operators";
import { SelectAuthProviderComponent } from "../../../../../shared/components/select-auth-provider/select-auth-provider.component";
import { AuthProvider } from "../../../../../auth/services/auth-provider";
import { Errors } from "../../../../../shared/consts";
import { StakeDetails } from "../../../../components/staking/staking.component";
import { StakeValidator } from "../../../../validators/stake.validator";
import { ComponentAuthService } from "../../../../services/component-auth.service";

@Component({
  selector: "app-freeze",
  templateUrl: "./freeze.component.html",
  styleUrls: ["./freeze.component.scss"]
})
export class FreezeComponent implements OnInit, OnDestroy {
  @Input() config: CoinProviderConfig;
  @Input() balance: Observable<BigNumber>;
  @Input() hasProvider: Observable<boolean>;
  @Input() max: number;
  @Input() price: Observable<BigNumber>;
  @Input() prepareTx: (amount: BigNumber) => Observable<any>;
  @Input() formatMax: (max: BigNumber) => string;

  stakeForm: FormGroup;
  max$: Observable<BigNumber>;
  isLoading = false;
  details$: Observable<StakeDetails>;
  usdAmount = new Subject();

  priceSubs: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private dialogService: DialogsService,
    private router: Router,
    private errorsService: ErrorsService,
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
    const amount = this.config.toUnits(
      new BigNumber(this.stakeForm.get("amount").value)
    );

    const stake$ = this.prepareTx(amount).pipe(
      tap(
        () => {
          this.isLoading = false;
        },
        e => {
          this.isLoading = false;
        }
      ),
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

  setMax() {
    this.max$.subscribe(max => {
      this.stakeForm.get("amount").setValue(this.formatMax(max));
    });
  }

  getMax(): Observable<BigNumber> {
    return this.balance.pipe(
      map(balance => {
        return balance.isGreaterThan(0) ? balance : new BigNumber(0);
      }),
      shareReplay(1)
    );
  }

  congratulate(config: CoinProviderConfig, sum: number) {
    const modalRef = this.dialogService.showSuccess(
      `You have successfully frozen ${sum} ${config.currencySymbol}s`
    );
    modalRef.result.then(
      data => {
        location.reload();
      },
      reason => {
        location.reload();
      }
    );
  }

  ngOnInit(): void {
    this.stakeForm
      .get("amount")
      .setAsyncValidators([
        StakeValidator(true, this.config, this.balance, of(null), this.max)
      ]);

    this.max$ = this.getMax();
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
    this.priceSubs.unsubscribe();
  }
}

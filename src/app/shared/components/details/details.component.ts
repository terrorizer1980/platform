import { AfterViewInit, Component, Input } from "@angular/core";
import { combineLatest, forkJoin, Observable, of, throwError } from "rxjs";
import { BlockatlasValidator } from "@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, first, map, switchMap } from "rxjs/operators";
import { CosmosDelegation } from "@trustwallet/rpc/src/cosmos/models/CosmosDelegation";
import { CoinService } from "../../../coins/services/coin.service";
import { SelectAuthProviderComponent } from "../select-auth-provider/select-auth-provider.component";
import { AuthProvider } from "../../../auth/services/auth-provider";
import { Errors } from "../../consts";
import { DialogsService } from "../../services/dialogs.service";
import { AuthService } from "../../../auth/services/auth.service";
import { fromPromise } from "rxjs/internal-compatibility";
import { Delegation } from "../../../dto";
import BigNumber from "bignumber.js";

export interface DetailsValidatorInterface {
  validator: BlockatlasValidator;
  stakedSum: string;
  additionals: AdditionalInfo[];
  hasProvider: boolean;
  unstakeEnabled: boolean;
}

export interface AdditionalInfo {
  name: string;
  value: string;
}

@Component({
  selector: "app-shared-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"]
})
export class DetailsComponent implements AfterViewInit {
  @Input() validatorId: string;
  @Input() dataSource: CoinService;
  @Input() additionals: Observable<AdditionalInfo[]>;

  details$: Observable<DetailsValidatorInterface>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogsService,
    private auth: AuthService
  ) {}

  // Staked amount per validator - we have that
  getStakedAmount(address: string): Observable<string> {
    return combineLatest([
      this.dataSource.getConfig(),
      this.dataSource.getAddressDelegations(address)
    ]).pipe(
      map(([config, delegations]) => {
        if (!delegations) {
          return "0";
        }

        return delegations
          .filter(d => d.address === this.validatorId)
          .reduce((acc, d) => acc.plus(config.toCoin(d.amount)), new BigNumber(0))
          .toFixed(6);
      })
    );
  }

  navigateToStake(hasProvider: boolean) {
    if (hasProvider) {
      this.router.navigate([`stake`], { relativeTo: this.activatedRoute });
    } else {
      const modal = this.dialogService.showModal(SelectAuthProviderComponent);
      modal.componentInstance.select
        .pipe(
          switchMap((provider: AuthProvider) =>
            combineLatest([this.auth.authorize(provider), of(provider)])
          ),
          switchMap(([authorized, provider]) =>
            authorized ? authorized : throwError("closed")
          ),
          switchMap(_ =>
            fromPromise(
              this.router.navigate([`stake`], {
                relativeTo: this.activatedRoute
              })
            )
          ),
          catchError(error => {
            if (error === "closed") {
              return throwError(Errors.REJECTED_BY_USER);
            }
            return throwError(error);
          })
        )
        .subscribe(
          result => {
            location.reload();
          },
          error => {
            throw error;
          }
        );
    }
  }

  navigateToUnStake() {
    this.router.navigate([`unstake`], { relativeTo: this.activatedRoute });
  }

  ngAfterViewInit(): void {
    this.details$ = forkJoin({
      validator: this.dataSource
        .getValidatorsById(this.validatorId)
        .pipe(first()),
      stakedSum: this.dataSource.getAddress().pipe(
        switchMap((address: string) => {
          return this.getStakedAmount(address);
        }),
        catchError(_ => of("0")),
        first()
      ),
      additionals: this.additionals.pipe(first()),
      unstakeEnabled: this.dataSource.isUnstakeEnabled().pipe(first()),
      hasProvider: this.dataSource.hasProvider()
    });
  }
}

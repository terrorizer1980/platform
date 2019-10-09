import { AfterViewInit, Component, Input, OnDestroy } from "@angular/core";
import {
  combineLatest,
  forkJoin,
  Observable,
  of,
  Subscription,
  throwError
} from "rxjs";
import { BlockatlasValidator } from "@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, first, map, switchMap } from "rxjs/operators";
import { CosmosDelegation } from "@trustwallet/rpc/src/cosmos/models/CosmosDelegation";
import { CoinService } from "../../services/coin.service";
import BigNumber from "bignumber.js";
import { SelectAuthProviderComponent } from "../../../shared/components/select-auth-provider/select-auth-provider.component";
import { AuthProvider } from "../../../auth/services/auth-provider";
import { Errors } from "../../../shared/consts";
import { DialogsService } from "../../../shared/services/dialogs.service";
import { AuthService } from "../../../auth/services/auth.service";
import { fromPromise } from "rxjs/internal-compatibility";
import {CoinProviderConfig} from "../../coin-provider-config";

export interface DetailsValidatorInterface {
  additionals: AdditionalInfo[];
  hasProvider: boolean;
  unstakeEnabled: boolean;
  config: CoinProviderConfig
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
  @Input() isUnstakeEnabled: Observable<boolean>;
  @Input() hasProvider: Observable<boolean>;
  @Input() config: Observable<CoinProviderConfig>;
  @Input() additionals: Observable<AdditionalInfo[]>;

  details$: Observable<DetailsValidatorInterface>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogsService,
    private auth: AuthService
  ) {}

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
      additionals: this.additionals.pipe(first()),
      unstakeEnabled: this.isUnstakeEnabled.pipe(first()),
      hasProvider: this.hasProvider,
      config: this.config.pipe(first())
    });
  }
}

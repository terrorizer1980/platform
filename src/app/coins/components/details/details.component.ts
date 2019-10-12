import {
  AfterViewInit,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef
} from "@angular/core";
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
import { CoinProviderConfig } from "../../coin-provider-config";
import { ContentDirective } from "../../../shared/directives/content.directive";
import { WithdrawDirective } from "./directives/withdraw.directive";
import { StakeDirective } from "./directives/stake.directive";

export interface DetailsValidatorInterface {
  additionals: AdditionalInfo[];
  hasProvider: boolean;
  unstakeEnabled: boolean;
  config: CoinProviderConfig;
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
  @Input() releaseDate: Observable<string>;
  @Input() hasProvider: Observable<boolean>;
  @Input() config: Observable<CoinProviderConfig>;
  @Input() additionals: Observable<AdditionalInfo[]>;
  @Output() stake = new EventEmitter();
  @Output() unstake = new EventEmitter();

  @ContentChild(WithdrawDirective, { read: TemplateRef, static: false })
  withdrawTemplate;

  @ContentChild(StakeDirective, { read: TemplateRef, static: false })
  stakeTemplate;

  details$: Observable<DetailsValidatorInterface>;

  constructor(
    private dialogService: DialogsService,
    private auth: AuthService
  ) {}

  navigateToStake(hasProvider: boolean) {
    if (hasProvider) {
      this.stake.next();
    } else {
      const modal = this.dialogService.showModal(SelectAuthProviderComponent, {
        windowClass: "small-popup"
      });
      modal.componentInstance.select
        .pipe(
          switchMap((provider: AuthProvider) =>
            combineLatest([this.auth.authorize(provider), of(provider)])
          ),
          switchMap(([authorized, provider]) =>
            authorized ? authorized : throwError("closed")
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
    this.unstake.next();
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

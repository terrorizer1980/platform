import { Component, Inject } from "@angular/core";
import { Observable, of, throwError, timer } from "rxjs";
import { CosmosService } from "../../services/cosmos.service";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { CosmosConfigService } from "../../services/cosmos-config.service";
import { CosmosProviderConfig } from "../../cosmos.descriptor";
import BigNumber from "bignumber.js";
import { StakeAction, StakeHolder } from "../../../../coin-provider-config";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CosmosTx } from "@trustwallet/rpc/lib/cosmos/models/CosmosTx";
import { UnstakingStatusComponent } from "../unstaking-status/unstaking-status.component";
import { DialogsService } from "../../../../../shared/services/dialogs.service";

@Component({
  selector: "app-unstaking",
  templateUrl: "./unstaking.component.html",
  styleUrls: ["./unstaking.component.scss"]
})
export class UnstakingComponent {
  unstakingStatusRef: NgbModalRef;
  balance = this.cosmos
    .getBalanceCoins()
    .pipe(catchError(_ => of(new BigNumber(0))));
  validators: Observable<Array<StakeHolder>> = this.cosmos.getStakeHolders();
  price = this.cosmos.getPriceUSD();
  timeFrame = this.cosmos
    .getStakingInfo()
    .pipe(map(info => info.timeFrame.day));
  prepareTx = (
    action: StakeAction,
    addressTo: string,
    amount: BigNumber
  ): Observable<CosmosTx> => {
    this.unstakingStatusRef = this.dialogsService.showModal(
      UnstakingStatusComponent,
      {
        backdrop: "static",
        keyboard: false
      }
    );

    return this.cosmos.unstake(addressTo, amount).pipe(
      switchMap(result => this.cosmos.waitForTx(result.txhash)),
      tap(_ => {
        this.unstakingStatusRef.componentInstance.steps[0] = true;
      }),
      switchMap(tx => this.cosmos.withdraw(addressTo).pipe(map(() => tx))),
      tap(_ => {
        this.unstakingStatusRef.componentInstance.steps[1] = true;
      }),
      switchMap(result => timer(300).pipe(map(() => result))),
      tap(() => {
        this.unstakingStatusRef.close();
      }),
      catchError(err => {
        this.unstakingStatusRef.close();
        return throwError(err);
      })
    );
  };

  formatMax(max: BigNumber): string {
    return max.toFormat(2, BigNumber.ROUND_DOWN);
  }

  constructor(
    @Inject(CosmosConfigService)
    public config: Observable<CosmosProviderConfig>,
    public cosmos: CosmosService,
    public dialogsService: DialogsService
  ) {}
}

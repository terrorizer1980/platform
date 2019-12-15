import { Component, Inject, OnDestroy } from "@angular/core";
import { Observable, of } from "rxjs";
import { CosmosService } from "../../services/cosmos.service";
import { catchError, map } from "rxjs/operators";
import { CosmosConfigService } from "../../services/cosmos-config.service";
import { CosmosProviderConfig } from "../../cosmos.descriptor";
import BigNumber from "bignumber.js";
import { StakeHolder } from "../../../../coin-provider-config";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-unstaking",
  templateUrl: "./unstaking.component.html",
  styleUrls: ["./unstaking.component.scss"]
})
export class UnstakingComponent implements OnDestroy {
  unstakingStatusRef: NgbModalRef;
  balance = this.cosmos
    .getBalanceCoins()
    .pipe(catchError(_ => of(new BigNumber(0))));
  validators: Observable<Array<StakeHolder>> = this.cosmos.getStakeHolders();
  price = this.cosmos.getPriceUSD();
  timeFrame = this.cosmos
    .getStakingInfo()
    .pipe(map(info => info.timeFrame.day));
  prepareTx = this.cosmos.prepareStakeTx.bind(this.cosmos);

  formatMax(max: BigNumber): string {
    return max.toFormat(2, BigNumber.ROUND_DOWN);
  }

  ngOnDestroy(): void {
    if (this.unstakingStatusRef) {
      this.unstakingStatusRef.close();
    }
  }

  constructor(
    @Inject(CosmosConfigService)
    public config: Observable<CosmosProviderConfig>,
    public cosmos: CosmosService
  ) {}
}

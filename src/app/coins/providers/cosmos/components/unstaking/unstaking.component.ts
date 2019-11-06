import { Component, Inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { CosmosService } from "../../services/cosmos.service";
import { ActivatedRoute } from "@angular/router";
import { catchError, map } from "rxjs/operators";
import { CosmosConfigService } from "../../services/cosmos-config.service";
import { CosmosProviderConfig } from "../../cosmos.descriptor";
import BigNumber from "bignumber.js";
import { BlockatlasValidator } from "@trustwallet/rpc/lib";
import { StakeHolder } from "../../../../coin-provider-config";

@Component({
  selector: "app-unstaking",
  templateUrl: "./unstaking.component.html",
  styleUrls: ["./unstaking.component.scss"]
})
export class UnstakingComponent {
  balance = this.cosmos
    .getBalanceCoins()
    .pipe(catchError(_ => of(new BigNumber(0))));
  prepareTx = this.cosmos.prepareStakeTx.bind(this.cosmos);
  validators: Observable<Array<StakeHolder>> = this.cosmos.getStakeHolders();
  price = this.cosmos.getPriceUSD();
  timeFrame = this.cosmos
    .getStakingInfo()
    .pipe(map(info => info.timeFrame.day));

  constructor(
    @Inject(CosmosConfigService)
    public config: Observable<CosmosProviderConfig>,
    public cosmos: CosmosService
  ) {}

  formatMax(max: BigNumber): string {
    return max.toFormat(2, BigNumber.ROUND_DOWN);
  }
}

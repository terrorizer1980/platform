import { Component, Inject } from "@angular/core";
import { CosmosService } from "../../services/cosmos.service";
import { catchError, map } from "rxjs/operators";
import { CosmosConfigService } from "../../services/cosmos-config.service";
import { Observable } from "rxjs";
import { CosmosProviderConfig } from "../../cosmos.descriptor";
import {StakeHolder} from "../../../../coin-provider-config";
import BigNumber from "bignumber.js";

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"]
})
export class DetailsComponent {
  isUnstakeEnabled = this.cosmos.isUnstakeEnabled();
  hasProvider = this.cosmos.hasProvider();
  validators: Observable<StakeHolder[]> = this.cosmos.getStakeHolders().pipe(
    map(stakeHolders => {
      return stakeHolders.map(sh => {
        sh.amount = new BigNumber(sh.amount);
        return sh;
      });
    })
  );
  additionalInfo = this.cosmos.getStakingInfo().pipe(
    map(info => [
      {
        name: "Minimum Amount",
        value: 0.01
      },
      {
        name: "Withdraw Time",
        value: `${info.timeFrame.day} days`
      }
    ])
  );

  constructor(
    @Inject(CosmosConfigService)
    public config: Observable<CosmosProviderConfig>,
    public cosmos: CosmosService
  ) {}
}

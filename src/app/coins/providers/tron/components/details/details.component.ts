import { Component, Inject } from "@angular/core";
import { catchError, map } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { TronService } from "../../services/tron.service";
import { CosmosConfigService } from "../../../cosmos/services/cosmos-config.service";
import { Observable } from "rxjs";
import { CosmosProviderConfig } from "../../../cosmos/cosmos.descriptor";
import { TronConfigService } from "../../services/tron-config.service";
import { TronProviderConfig } from "../../tron.descriptor";
import { BlockatlasValidator } from "@trustwallet/rpc/lib";
import BigNumber from "bignumber.js";
import { StakeHolder } from "../../../../coin-provider-config";

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"]
})
export class DetailsComponent {
  isUnstakeEnabled = this.tron.isUnstakeEnabled();
  hasProvider = this.tron.hasProvider();
  validators: Observable<StakeHolder[]> = this.tron.getStakeHolders().pipe(
    map(stakeHolders => {
      return stakeHolders.map(sh => {
        sh.amount = new BigNumber(sh.amount);
        return sh;
      });
    })
  );
  additionalInfo = this.tron.getStakingInfo().pipe(
    map(info => [
      {
        name: "Minimum Amount",
        value: 1
      },
      {
        name: "Withdraw Time",
        value: `${info.lockTime} days`
      }
    ])
  );

  constructor(
    public tron: TronService,
    @Inject(TronConfigService)
    public config: Observable<TronProviderConfig>
  ) {}
}

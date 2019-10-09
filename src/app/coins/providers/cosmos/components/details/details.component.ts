import {Component, Inject} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CosmosService } from "../../services/cosmos.service";
import { catchError, map } from "rxjs/operators";
import {CosmosConfigService} from "../../services/cosmos-config.service";
import {Observable} from "rxjs";
import {CosmosProviderConfig} from "../../cosmos.descriptor";

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"]
})
export class DetailsComponent {
  isUnstakeEnabled = this.cosmos.isUnstakeEnabled();
  hasProvider = this.cosmos.hasProvider();
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
    public cosmos: CosmosService,
  ) {}
}

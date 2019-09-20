import { Component, Inject } from "@angular/core";
import { Observable } from "rxjs";
import { CosmosService } from "../../services/cosmos.service";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs/operators";
import { CosmosConfigService } from "../../services/cosmos-config.service";
import { CosmosProviderConfig } from "../../cosmos.descriptor";

@Component({
  selector: "app-unstaking",
  templateUrl: "./unstaking.component.html",
  styleUrls: ["./unstaking.component.scss"]
})
export class UnstakingComponent {
  validatorId: string = this.activatedRoute.snapshot.params.validatorId;
  timeFrame = this.cosmos
    .getStakingInfo()
    .pipe(map(info => info.timeFrame.day));

  constructor(
    @Inject(CosmosConfigService)
    public config: Observable<CosmosProviderConfig>,
    public cosmos: CosmosService,
    private activatedRoute: ActivatedRoute
  ) {}
}

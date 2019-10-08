import { Component, Inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { CosmosService } from "../../services/cosmos.service";
import { ActivatedRoute } from "@angular/router";
import { catchError, map } from "rxjs/operators";
import { CosmosConfigService } from "../../services/cosmos-config.service";
import { CosmosProviderConfig } from "../../cosmos.descriptor";
import BigNumber from "bignumber.js";

@Component({
  selector: "app-unstaking",
  templateUrl: "./unstaking.component.html",
  styleUrls: ["./unstaking.component.scss"]
})
export class UnstakingComponent {
  validatorId = this.activatedRoute.snapshot.params.validatorId;
  validator = this.cosmos.getValidatorsById(this.validatorId);
  staked = this.cosmos.getStakedToValidator(this.validatorId).pipe(
    catchError(_ => of(new BigNumber(0))),
  );
  balance = this.cosmos
    .getBalance()
    .pipe(catchError(_ => of(new BigNumber(0))));
  prepareTx = this.cosmos.prepareStakeTx.bind(this.cosmos);
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

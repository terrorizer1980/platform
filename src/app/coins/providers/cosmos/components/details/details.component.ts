import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CosmosService } from "../../services/cosmos.service";
import { catchError, map } from "rxjs/operators";
import { of } from "rxjs";
import BigNumber from "bignumber.js";

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"]
})
export class DetailsComponent {
  validatorId = this.activatedRoute.snapshot.params.validatorId;
  validator = this.cosmos.getValidatorsById(this.validatorId);
  isUnstakeEnabled = this.cosmos.isUnstakeEnabled();
  hasProvider = this.cosmos.hasProvider();
  staked = this.cosmos.getStakedToValidator(this.validatorId).pipe(
    catchError(_ => of(new BigNumber(0))),
    map(staked => staked.toFormat(2, BigNumber.ROUND_DOWN))
  );
  additionalInfo = this.cosmos.getStakingInfo().pipe(
    map(info => [
      {
        name: "Lock Time",
        value: `${info.timeFrame.day} days`
      }
    ])
  );

  constructor(
    public cosmos: CosmosService,
    private activatedRoute: ActivatedRoute
  ) {}
}

import { Component } from "@angular/core";
import { catchError, map } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { TronService } from "../../services/tron.service";
import { of } from "rxjs";
import BigNumber from "bignumber.js";
import { TronUtils } from "@trustwallet/rpc/lib";

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"]
})
export class DetailsComponent {
  validatorId = this.activatedRoute.snapshot.params.validatorId;
  validator = this.tron.getValidatorsById(this.validatorId);
  isUnstakeEnabled = this.tron.isUnstakeEnabled();
  hasProvider = this.tron.hasProvider();
  staked = this.tron.getStakedToValidator(this.validatorId).pipe(
    catchError(_ => of(new BigNumber(0))),
    map(staked => TronUtils.toTron(staked))
  );
  additionalInfo = this.tron.getStakingInfo().pipe(
    map(info => [
      {
        name: "Lock Time",
        value: `${info.lockTime} days`
      }
    ])
  );

  constructor(
    public tron: TronService,
    private activatedRoute: ActivatedRoute
  ) {}
}

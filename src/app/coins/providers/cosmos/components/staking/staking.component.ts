import { Component, Inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { CosmosService } from "../../services/cosmos.service";
import { ActivatedRoute } from "@angular/router";
import { CosmosConfigService } from "../../services/cosmos-config.service";
import { CosmosProviderConfig } from "../../cosmos.descriptor";
import BigNumber from "bignumber.js";
import { catchError, map } from "rxjs/operators";

@Component({
  selector: "app-test",
  templateUrl: "./staking.component.html",
  styleUrls: ["./staking.component.scss"]
})
export class StakingComponent {
  validatorId = this.activatedRoute.snapshot.params.validatorId;
  validator = this.cosmos.getValidatorsById(this.validatorId);
  hasProvider = this.cosmos.hasProvider();
  staked = this.cosmos.getStakedToValidator(this.validatorId).pipe(
    catchError(_ => of(new BigNumber(0))),
    map(staked => staked.toFormat(2, BigNumber.ROUND_DOWN))
  );
  balance = this.cosmos
    .getBalance()
    .pipe(catchError(_ => of(new BigNumber(0))));
  info = this.cosmos.getStakingInfo();
  prepareTx = this.cosmos.prepareStakeTx.bind(this.cosmos);

  constructor(
    @Inject(CosmosConfigService)
    public config: Observable<CosmosProviderConfig>,
    public cosmos: CosmosService,
    private activatedRoute: ActivatedRoute
  ) {}

  formatMax(max: BigNumber): string {
    return (Math.floor(max.toNumber() * 1000) / 1000).toString();
  }
}

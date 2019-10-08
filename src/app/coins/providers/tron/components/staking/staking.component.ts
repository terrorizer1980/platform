import { Component, Inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { TronProviderConfig } from "../../tron.descriptor";
import { TronConfigService } from "../../services/tron-config.service";
import { TronService } from "../../services/tron.service";
import BigNumber from "bignumber.js";
import { catchError, map } from "rxjs/operators";
import { TronUtils } from "@trustwallet/rpc/lib";

@Component({
  selector: "app-staking",
  templateUrl: "./staking.component.html",
  styleUrls: ["./staking.component.scss"]
})
export class StakingComponent {
  validatorId = this.activatedRoute.snapshot.params.validatorId;
  validator = this.tron.getValidatorsById(this.validatorId);
  hasProvider = this.tron.hasProvider();
  staked = this.tron.getStakedToValidator(this.validatorId).pipe(
    catchError(_ => of(new BigNumber(0))),
    map(staked => staked.toFormat(2, BigNumber.ROUND_DOWN))
  );
  balance = this.tron
    .getBalanceCoins()
    .pipe(catchError(_ => of(new BigNumber(0))));
  info = this.tron.getStakingInfo();
  prepareTx = this.tron.prepareStakeTx.bind(this.tron);

  constructor(
    @Inject(TronConfigService)
    public config: Observable<TronProviderConfig>,
    public tron: TronService,
    private activatedRoute: ActivatedRoute
  ) {}

  formatMax(max: BigNumber): string {
    return max.integerValue(BigNumber.ROUND_DOWN).toString();
  }
}

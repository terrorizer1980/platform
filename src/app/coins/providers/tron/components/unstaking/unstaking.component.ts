import { Component, Inject } from "@angular/core";
import { catchError, map } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { TronConfigService } from "../../services/tron-config.service";
import { TronProviderConfig } from "../../tron.descriptor";
import { TronService } from "../../services/tron.service";
import BigNumber from "bignumber.js";

@Component({
  selector: "app-unstaking",
  templateUrl: "./unstaking.component.html",
  styleUrls: ["./unstaking.component.scss"]
})
export class UnstakingComponent {
  validatorId = this.activatedRoute.snapshot.params.validatorId;
  validator = this.tron.getValidatorsById(this.validatorId);
  staked = this.tron.getStakedToValidator(this.validatorId).pipe(
    catchError(_ => of(new BigNumber(0))),
    map(staked => staked.toFormat(2, BigNumber.ROUND_DOWN))
  );
  balance = this.tron.getBalance().pipe(catchError(_ => of(new BigNumber(0))));
  prepareTx = this.tron.prepareStakeTx.bind(this.tron);
  timeFrame = this.tron.getStakingInfo().pipe(map(info => info.lockTime));

  constructor(
    @Inject(TronConfigService)
    public config: Observable<TronProviderConfig>,
    public tron: TronService,
    private activatedRoute: ActivatedRoute
  ) {}
}

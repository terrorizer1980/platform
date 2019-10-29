import { Component, Inject } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { TronProviderConfig } from "../../tron.descriptor";
import { TronConfigService } from "../../services/tron-config.service";
import { TronService } from "../../services/tron.service";
import BigNumber from "bignumber.js";
import { catchError, map } from "rxjs/operators";
import { BlockatlasValidator, TronUtils } from "@trustwallet/rpc/lib";

@Component({
  selector: "app-staking",
  templateUrl: "./staking.component.html",
  styleUrls: ["./staking.component.scss"]
})
export class StakingComponent {
  hasProvider = this.tron.hasProvider();
  balance = this.tron
    .getBalanceCoins()
    .pipe(catchError(_ => of(new BigNumber(0))));
  balanceFrozen = this.tron.getFreeFrozen().pipe(
    map(frozen => TronUtils.toTron(frozen)),
    catchError(_ => of(new BigNumber(0)))
  );
  info = this.tron.getStakingInfo();
  prepareVoteTx = this.tron.prepareStakeTx.bind(this.tron);
  prepareFreezeTx = this.tron.prepareFreezeTx.bind(this.tron);
  price = this.tron.getPriceUSD();
  validators: Observable<
    Array<BlockatlasValidator>
  > = this.tron.getValidators();
  amount = new Subject<BigNumber>();

  constructor(
    @Inject(TronConfigService)
    public config: Observable<TronProviderConfig>,
    public tron: TronService
  ) {}

  formatMax(max: BigNumber): string {
    return max.integerValue(BigNumber.ROUND_DOWN).toString();
  }
}

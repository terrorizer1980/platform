import { Component, Inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { CosmosService } from "../../services/cosmos.service";
import { ActivatedRoute } from "@angular/router";
import { CosmosConfigService } from "../../services/cosmos-config.service";
import { CosmosProviderConfig } from "../../cosmos.descriptor";
import BigNumber from "bignumber.js";
import { catchError, map } from "rxjs/operators";
import { BlockatlasValidator } from "@trustwallet/rpc/lib";

@Component({
  selector: "app-test",
  templateUrl: "./staking.component.html",
  styleUrls: ["./staking.component.scss"]
})
export class StakingComponent {
  hasProvider = this.cosmos.hasProvider();
  balance = this.cosmos
    .getBalanceCoins()
    .pipe(catchError(_ => of(new BigNumber(0))));
  info = this.cosmos.getStakingInfo();
  prepareTx = this.cosmos.prepareStakeTx.bind(this.cosmos);
  price = this.cosmos.getPriceUSD();
  validators: Observable<
    Array<BlockatlasValidator>
  > = this.cosmos.getValidators();

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

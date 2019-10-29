import { Component, Inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { TezosService } from "../../services/tezos.service";
import { TezosConfigService } from "../../services/tezos-config.service";
import { TezosProviderConfig } from "../../tezos.descriptor";
import BigNumber from "bignumber.js";
import { catchError, map, switchMap } from "rxjs/operators";
import { BlockatlasValidator } from "@trustwallet/rpc/lib";
import { StakeAction } from "../../../../coin-provider-config";

@Component({
  selector: "app-test",
  templateUrl: "./staking.component.html",
  styleUrls: ["./staking.component.scss"]
})
export class StakingComponent {
  hasProvider = this.tezos.hasProvider();
  balance = this.tezos.getBalanceCoins().pipe(
    map(balance => balance.toFormat(2)),
    catchError(_ => of(new BigNumber(0)))
  );
  info = this.tezos.getStakingInfo();
  prepareTx = this.tezos.prepareStakeTx.bind(this.tezos);
  price = this.tezos.getPriceUSD();
  validators: Observable<
    Array<BlockatlasValidator>
  > = this.tezos.getValidators();
  balanceUsd = this.tezos.getBalanceUSD().pipe(
    map(balance => balance.toFormat(2)),
    catchError(_ => of(new BigNumber(0)))
  );
  isLoading = false;

  constructor(
    @Inject(TezosConfigService)
    public config: Observable<TezosProviderConfig>,
    public tezos: TezosService
  ) {}

  formatMax(max: BigNumber): string {
    return (Math.floor(max.toNumber() * 1000) / 1000).toString();
  }
}

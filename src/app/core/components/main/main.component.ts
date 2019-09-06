import { forkJoin, Observable, of, ReplaySubject } from "rxjs";
import { Router } from "@angular/router";
import { map, shareReplay } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { AccountService } from "../../services/account.service";
import { Coins } from "../../../coins/coins";
import {
  CoinProviderConfig,
  StakeHolder,
  StakeHolderList
} from "../../../coins/coin-provider-config";
import { CoinsReceiverService } from "../../../shared/services/coins-receiver.service";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"]
})
export class MainComponent implements OnInit {
  myStakeHolders$: Observable<StakeHolderList> = new ReplaySubject();
  annuals: { [key: string]: Observable<number> };
  blockchains = Coins;

  constructor(
    private router: Router,
    private coinsReceiverService: CoinsReceiverService
  ) {
    this.annuals = Coins.reduce(
      (annuals, coin, index) => ({
        ...annuals,
        [coin.network]: this.coinsReceiverService.blochchainServices[
          index
        ].getAnnualPercent()
      }),
      {}
    );
  }

  ngOnInit(): void {
    this.myStakeHolders$ = forkJoin(
      this.coinsReceiverService.blochchainServices.map(service =>
        service.getStakeHolders()
      )
    ).pipe(
      map(holder => {
        return holder.reduce((acc, stakeHolders, index) => {
          stakeHolders.forEach(sh => {
            sh.coin = Coins[index];
          });
          return [...acc, ...stakeHolders];
        }, []);
      }),
      shareReplay(1)
    ) as Observable<StakeHolderList>;
  }

  navigateToPosDelegatorsList(item: CoinProviderConfig) {
    this.router.navigate([`/blockchain/${item.network}`]);
  }

  navigateToMyStakeHoldersList(holder: StakeHolder) {
    this.router.navigate([
      `/blockchain/${holder.coin.network}/details/${holder.id}`
    ]);
  }
}

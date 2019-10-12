import { forkJoin, Observable, of, ReplaySubject, throwError } from "rxjs";
import { Router } from "@angular/router";
import { catchError, first, map, shareReplay } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { Coins, Upcoming, UpcomingCoin } from "../../../coins/coins";
import {
  CoinProviderConfig,
  StakeHolder,
  StakeHolderList
} from "../../../coins/coin-provider-config";
import { CoinsReceiverService } from "../../../shared/services/coins-receiver.service";
import BigNumber from "bignumber.js";

interface CoinDescriptor {
  item: CoinProviderConfig;
  annual: number;
  available: string;
  stakingInfo: any;
}

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"]
})
export class MainComponent {
  blockchains$: Observable<CoinDescriptor[]>;
  upcomings: Observable<UpcomingCoin[]>;
  coinsCount = Coins.length;

  constructor(
    private router: Router,
    private coinsReceiverService: CoinsReceiverService
  ) {
    this.blockchains$ = forkJoin(
      Coins.map((coin, index) => {
        const service = this.coinsReceiverService.blochchainServices[index];
        return forkJoin({
          item: of(coin).pipe(first()),
          annual: service.getAnnualPercent().pipe(first()),
          available: service.getBalanceCoins().pipe(
            map(balance => balance.toFormat(2, BigNumber.ROUND_DOWN)),
            catchError(() => of("0")),
            first()
          ),
          stakingInfo: service.getStakingInfo().pipe(first())
        });
      })
    ).pipe(
      catchError(err => {
        return throwError(err);
      })
    ) as Observable<CoinDescriptor[]>;

    this.upcomings = of(Upcoming);
  }

  navigateToDetails(item: CoinProviderConfig) {
    this.router.navigate([`/blockchain/${item.network}`]);
  }
}

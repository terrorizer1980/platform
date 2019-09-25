import { forkJoin, Observable, of, ReplaySubject, throwError } from "rxjs";
import { Router } from "@angular/router";
import { catchError, first, map, shareReplay } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { Coins } from "../../../coins/coins";
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
  pending: BigNumber;
  unstakingDate: Date;
  stakingInfo: any;
}

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"]
})
export class MainComponent implements OnInit {
  myStakeHolders$: Observable<StakeHolderList> = new ReplaySubject(1);
  blockchains$: Observable<CoinDescriptor[]>;

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
          pending: service.getStakePendingBalance().pipe(
            catchError(_ => of(new BigNumber(0))),
            first()
          ),
          unstakingDate: service.getUnstakingDate().pipe(
            catchError(_ => of(null)),
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
  }

  ngOnInit(): void {
    this.myStakeHolders$ = forkJoin(
      this.coinsReceiverService.blochchainServices.map(service =>
        service.getStakeHolders().pipe(catchError(_ => of([])))
      )
    ).pipe(
      map(holder => {
        return holder.reduce((acc, stakeHolders, index) => {
          stakeHolders.forEach(sh => {
            sh.coin = Coins[index];
            sh.amount = new BigNumber(sh.amount.toFixed(5));
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

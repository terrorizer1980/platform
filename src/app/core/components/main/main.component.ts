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
  address: string;
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
          address: service.getAddress().pipe(
            catchError(_ => of(true)),
            first()
          ),
          pending: service.getStakePendingBalance().pipe(first()),
          unstakingDate: service.getUnstakingDate().pipe(
            catchError(_ => of(null)),
            first()
          ),
          stakingInfo: service.getStakingInfo().pipe(first())
        });
      })
    ).pipe(
      catchError(err => {
        console.log(err);
        return throwError(err);
      })
    ) as Observable<CoinDescriptor[]>;
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

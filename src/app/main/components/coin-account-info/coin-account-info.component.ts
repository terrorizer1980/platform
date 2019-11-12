import { Component } from "@angular/core";
import { combineLatest, forkJoin, Observable, of } from "rxjs";
import { catchError, map, shareReplay, switchMap } from "rxjs/operators";
import BigNumber from "bignumber.js";
import { CoinAtlasService } from "../../../coins/services/atlas/coin-atlas.service";
import { Coins } from "../../../coins/coins";
import { AuthService } from "../../../auth/services/auth.service";
import { ExchangeRateService } from "../../../shared/services/exchange-rate.service";
import { CoinType, CoinTypeUtils } from "@trustwallet/types";
import { BlockatlasDelegation, DelegationStatus } from "@trustwallet/rpc";
import { BlockatlasDelegationBatch } from "@trustwallet/rpc/lib";
import { CoinProviderConfig } from "../../../coins/coin-provider-config";

@Component({
  selector: "app-coin-account-info",
  templateUrl: "./coin-account-info.component.html",
  styleUrls: ["./coin-account-info.component.scss"]
})
export class CoinAccountInfoComponent {
  fiatBalance$: Observable<string>;
  fiatStaked$: Observable<string>;

  constructor(
    private coinAtlasService: CoinAtlasService,
    private authService: AuthService,
    private exchangeRateService: ExchangeRateService
  ) {
    const delegations$ = this.getDelegationsBatch();

    this.fiatBalance$ = delegations$.pipe(
      map(({ batch, coins }) => {
        const balances = batch.map(val => {
          const coin = coins.find(
            c => CoinTypeUtils.symbol(c.coin) === val.coin.symbol
          );
          return coin.toCoin(val.balance).multipliedBy(coin.price);
        });
        const total = balances.reduce(
          (acc, val) => acc.plus(val),
          new BigNumber(0)
        );
        return total.toFormat(2);
      }),
      catchError(_ => of("0.00")),
      shareReplay(1)
    );

    this.fiatStaked$ = delegations$.pipe(
      map(({ batch, coins }) => {
        // Group delegations by coin symbol
        const delegationsMap = batch.reduce((acc, del) => {
          return { ...acc, [del.coin.symbol]: del.delegations };
        }, {});

        // Convert the delegation map to an array of values
        const values = Object.keys(delegationsMap).map(coinSymbol => {
          const delegations = delegationsMap[coinSymbol] || [];
          const coin = coins.find(
            c => CoinTypeUtils.symbol(c.coin) === coinSymbol
          );
          return delegations.reduce(
            (acc, del) =>
              acc.plus(coin.toCoin(del.value).multipliedBy(coin.price)),
            new BigNumber(0)
          );
        });

        return values
          .reduce((acc, val) => acc.plus(val), new BigNumber(0))
          .toFormat(2);
      }),
      catchError(_ => of("0.00")),
      shareReplay(1)
    );
  }

  private getDelegationsBatch(): Observable<{
    batch: BlockatlasDelegationBatch[];
    coins: SupportedCoin[];
  }> {
    return this.getSupportedCoins().pipe(
      switchMap(coins =>
        forkJoin({
          coins: of(coins),
          batch: this.coinAtlasService.getValidatorsBatch(coins)
        })
      ),
      shareReplay(1)
    );
  }

  private getSupportedCoins(): Observable<SupportedCoin[]> {
    return combineLatest(
      Coins.map(desc =>
        forkJoin({
          toCoin: of(desc.toCoin.bind(desc)),
          coin: of(desc.coin),
          address: this.getAddress(desc.coin),
          price: this.exchangeRateService.getRate(desc.coin)
        })
      )
    ).pipe(
      map(coins => coins.filter(c => c.address != null)),
      shareReplay(1)
    );
  }

  private getAddress(coin: CoinType): Observable<string> {
    return this.authService
      .getAddressFromAuthorized(coin)
      .pipe(catchError(_ => of(null)));
  }
}

interface SupportedCoin {
  toCoin: (amount: BigNumber) => BigNumber;
  coin: CoinType;
  address: string;
  price: BigNumber;
}

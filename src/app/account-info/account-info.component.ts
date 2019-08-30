import {Component} from '@angular/core';
import {CosmosService, CosmosServiceInstance} from '../services/cosmos.service';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {ExchangeRateService} from '../services/exchange-rate.service';
import {AccountService} from '../services/account.service';

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss']
})
export class AccountInfoComponent {

  fiatBalance$: Observable<number>;
  fiatStaked$: Observable<number>;

  constructor(private accountService: AccountService, exchangeRateService: ExchangeRateService, cosmosService: CosmosService) {

    const exchangeRate$ = exchangeRateService.exchangeRate$;

    this.fiatBalance$ = cosmosService.instance$.pipe(
      switchMap((cosmos: CosmosServiceInstance) => {
        return combineLatest([exchangeRate$, cosmos.balance$]);
      }),
      map((x: any[]) => {
        const [exchangeRate, rawBalance] = x;
        return (Number(exchangeRate) * Number(rawBalance));
      }),
      shareReplay(1)
    );

    this.fiatStaked$ = cosmosService.instance$.pipe(
      switchMap((cosmos: CosmosServiceInstance) => {
        return combineLatest([exchangeRate$, cosmos.stakedAmount$]);
      }),
      map((x: any[]) => {
        const [exchangeRate, rawStaked] = x;
        return (Number(exchangeRate) * Number(rawStaked));
      }),
      shareReplay(1)
    );
  }
}

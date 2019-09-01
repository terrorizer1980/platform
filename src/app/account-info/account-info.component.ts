import {Component} from '@angular/core';
import {CosmosService} from '../services/cosmos.service';
import {combineLatest, Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
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

  constructor(private accountService: AccountService, exchangeRateService: ExchangeRateService, cosmos: CosmosService) {

    const exchangeRate$ = exchangeRateService.exchangeRate$;

    // convertToFiatPipeline();
    this.fiatBalance$ = combineLatest([exchangeRate$, cosmos.balance$]).pipe(
      map((x: any[]) => {
        // TODO: split to several variables to introduce typts
        const [exchangeRate, cryptoBalance] = x;
        return (Number(exchangeRate) * Number(cryptoBalance));
      }),
      shareReplay(1)
    );

    this.fiatStaked$ = combineLatest([exchangeRate$, cosmos.stakedAmount$]).pipe(
      map((x: any[]) => {
        // TODO: split to several variables to introduce typts
        const [exchangeRate, cryptoBalance] = x;
        return (Number(exchangeRate) * Number(cryptoBalance));
      }),
      shareReplay(1)
    );
  }
}

import {Injectable} from '@angular/core';
import {interval, Observable, timer} from 'rxjs';
import {formatLikeEthAddress} from '../helpers';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {IPriceResponse} from '../dto';
import {CoinType} from '@trustwallet/types/lib/CoinType';
import {HttpClient} from '@angular/common/http';

export const priceUri = 'https://api.trustwallet.com/prices';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {

  exchangeRate$: Observable<string>;

  constructor(private http: HttpClient) {
    this.exchangeRate$ = timer(0, 15000).pipe(
      switchMap(() => {
        return this.requestCosmos2UsdRate();
      }),
      shareReplay(1)
    );

    this.exchangeRate$.subscribe(); // Init exchangeRate$ retrieval immediately
  }

  requestCosmos2UsdRate(): Observable<string> {
    const addr = formatLikeEthAddress(CoinType.cosmos);
    const body = {
      'currency': 'USD',
      'tokens': [
        {
          'contract': addr
        }
      ]
    };

    return this.http.post(priceUri, body).pipe(
      map((result: IPriceResponse) => {
        const coins = result.docs;
        const cosmos = coins.find((coin) => coin.contract === addr);
        return cosmos.price;
      })
    );
  }
}

import {Component, OnInit} from '@angular/core';
import {TrustProviderService} from '../trust-provider.service';
import {CosmosService, CosmosServiceInstance} from '../cosmos.service';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

interface IFiatDetails {
  balance: Number;
  staked: Number;
}

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss']
})
export class AccountInfoComponent implements OnInit {
  cosmosInstance: CosmosServiceInstance;
  subscription: Subscription;
  fiatDetails$: Observable<IFiatDetails>;

  constructor(private trustProvider: TrustProviderService, private cosmos: CosmosService) {

    // this.subscription = this.trustProvider.currentAccount$.subscribe(( account ) => {
    this.cosmosInstance = this.cosmos.getInstance('cosmos1cj7u0wpe45j0udnsy306sna7peah054upxtkzk');
    this.fiatDetails$ =
      combineLatest(
        [this.cosmosInstance.getPrice(), this.cosmosInstance.balance$, this.cosmosInstance.getStakedAmount()]).pipe(
        map((x: any[]) => {
          const [price, rawBalance, rawStaked] = x;
          const balance = (Number(price) * Number(rawBalance));
          const staked = (Number(price) * Number(rawStaked));
          const fiatDetails: IFiatDetails = {balance, staked};
          return fiatDetails;
        }),
        shareReplay(1)
      );
    // });
  }

  ngOnInit() {
  }

}

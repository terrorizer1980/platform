import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CosmosService, CosmosServiceInstance, Validator} from '../cosmos.service';
import {Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';

@Component({
  selector: 'app-pos-delegators',
  templateUrl: './pos-delegators.component.html',
  styleUrls: ['./pos-delegators.component.scss']
})
export class PosDelegatorsComponent {

  blockchain: string;
  validators: Array<Validator> = [];
  cosmosInstance: CosmosServiceInstance;

  constructor(activatedRoute: ActivatedRoute, private http: HttpClient, private cosmos: CosmosService, private router: Router,) {
    this.blockchain = activatedRoute.snapshot.params.blockchainId;
    this.cosmosInstance = this.cosmos.getInstance('cosmos1cj7u0wpe45j0udnsy306sna7peah054upxtkzk');

    this.getValidators().subscribe((validators: Array<Validator>) => {
      this.validators = validators;
    });
  }

  // @ts-ignore
  getValidators(): Observable<Array<Validator>> {
    // @ts-ignore
    return this.cosmosInstance.getValidators().pipe(
      map((x) => {
        // @ts-ignore
        return x.docs;
      }),
      take(1)
    );
  }

  navigateToMyStakeHoldersList(item: Validator) {
    this.router.navigate([`/details/${item.id}`]);
  }

}

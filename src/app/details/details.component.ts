import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CosmosService, CosmosServiceInstance} from '../services/cosmos.service';
import {map, take} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BlockatlasValidator} from '@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  validatorId: string;
  validator: BlockatlasValidator;
  cosmosInstance: CosmosServiceInstance;
  stakedSum: Observable<string>;

  constructor( activatedRoute: ActivatedRoute, private http: HttpClient, private cosmos: CosmosService ) {
    this.validatorId = activatedRoute.snapshot.params.validatorId;
    this.cosmosInstance = this.cosmos.getInstance('cosmos1cj7u0wpe45j0udnsy306sna7peah054upxtkzk');
  }

  ngOnInit() {
    this.getValidator(this.validatorId).subscribe(( validator: BlockatlasValidator ) => {
      this.validator = validator;
    });
    this.stakedSum = this.getStakedAmount(this.validatorId);
  }

  getValidator( validatorId: string ): Observable<BlockatlasValidator> {

    return this.cosmosInstance.getValidators().pipe(
      map(( x ) => {
        // @ts-ignore
        const a = [];
        // @ts-ignore
        x.docs.forEach(( i ) => {
          if (i.id === validatorId) {
            // @ts-ignore
            a.push(i);
          }
        });
        return a[0];
      }),
      take(1)
    );
  }

  getStakedAmount( validatorId: string ): Observable<string> {
    return this.cosmosInstance.getDelegations().pipe(
      map(( response ) => {
        if (!response) {
          return '0';
        }

        const stakedSumArray = [];
        response.forEach(( i ) => {
          stakedSumArray.push(Number(i.shares) / 1000000);
        });

        return stakedSumArray.reduce(( a, b ) => a + b, 0).toFixed(6);
      })
    );
  }


}

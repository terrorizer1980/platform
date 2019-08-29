import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {CosmosService, CosmosServiceInstance} from "../cosmos.service";
import {find, map, take} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {IValidator, IValidators} from '../dto';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  validatorId : string;
  validator : IValidator;
  cosmosInstance : CosmosServiceInstance;
  stakedSum : Observable<string>;
  constructor( activatedRoute : ActivatedRoute, private http : HttpClient, private cosmos : CosmosService ) {
    this.validatorId = activatedRoute.snapshot.params.validatorId;
    this.cosmosInstance = this.cosmos.getInstance('cosmos1cj7u0wpe45j0udnsy306sna7peah054upxtkzk');

  }

  ngOnInit() {
    this.getValidator(this.validatorId).subscribe(( validator : IValidator ) => {
      this.validator = validator;
    });
    this.stakedSum = this.getStakedAmount(this.validatorId);
  }

  getValidator( validatorId : string ) : Observable<IValidator> {

    // @ts-ignore
    return this.cosmosInstance.getValidators().pipe(
      map(( x ) => {
        // @ts-ignore
        const a = [];
        // @ts-ignore
        x.docs.forEach(( i ) => {
          if (i.id == validatorId) {
            // @ts-ignore
            a.push(i);
          }
        });
        return a[0];
      }),
      take(1)
    );
  }

  getStakedAmount( validatorId : string ) : Observable<string> {
    return this.cosmosInstance.getDelegations().pipe(
      map(( response ) => {
        if(response)    {
          let stakedSumArray = [];
          response.forEach(( i ) => {
            // @ts-ignore
            stakedSumArray.push(Number(i.shares) / 1000000);

          });
          // @ts-ignore
          return stakedSumArray.reduce((a,b) => a + b, 0).toFixed(6)
        }
        return "0";
      })
    )
  }


}

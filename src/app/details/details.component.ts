import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CosmosService, CosmosServiceInstance} from '../services/cosmos.service';
import {map, take} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {BlockatlasValidator, BlockatlasValidatorResult} from '@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator';
import {CosmosDelegation} from '@trustwallet/rpc/src/cosmos/models/CosmosDelegation';

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
  cosmos: Observable<CosmosServiceInstance>;

  constructor(activatedRoute: ActivatedRoute, cosmosService: CosmosService) {
    this.validatorId = activatedRoute.snapshot.params.validatorId;
    this.cosmos = cosmosService.instance$;
  }

  ngOnInit() {
    this.cosmosInstance.getValidator(this.validatorId)
      .subscribe((validator: BlockatlasValidator) => {
        this.validator = validator;
      });

    this.stakedSum = this.getStakedAmount(this.validatorId);
  }

  getStakedAmount(validatorId: string): Observable<string> {
    return this.cosmosInstance.getDelegations().pipe(
      map((response: CosmosDelegation[]) => {
        if (!response) {
          return '0';
        }

        // TODO: make it one reduce call
        const stakedSumArray = [];
        response.forEach((i: CosmosDelegation) => {
          if (i.validatorAddress === this.validatorId) {
            stakedSumArray.push(Number(i.shares) / 1000000);
          }
        });

        return stakedSumArray.reduce((a, b) => a + b, 0).toFixed(6);
      })
    );
  }


}

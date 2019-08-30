import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CosmosService, CosmosServiceInstance} from '../services/cosmos.service';
import {map, take, tap} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {BlockatlasValidator, BlockatlasValidatorResult} from '@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator';
import {CosmosDelegation} from '@trustwallet/rpc/src/cosmos/models/CosmosDelegation';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnDestroy {
  validatorId: string;
  validator: BlockatlasValidator;
  stakedSum: Observable<string>;
  cosmos: Observable<CosmosServiceInstance>;
  subscription: Subscription;

  constructor(private router: Router, activatedRoute: ActivatedRoute, cosmosService: CosmosService) {
    this.validatorId = activatedRoute.snapshot.params.validatorId;
    this.cosmos = cosmosService.instance$;

    this.subscription = cosmosService.instance$.pipe(
      tap((cosmosInstance: CosmosServiceInstance) => {
        this.stakedSum = this.getStakedAmount(cosmosInstance, this.validatorId);
        cosmosInstance.getValidator(this.validatorId).subscribe(
          (validator: BlockatlasValidator) => {
            this.validator = validator;
          }
        );
      })
    ).subscribe();
  }

  getStakedAmount(cosmosInstance: CosmosServiceInstance, validatorId: string): Observable<string> {
    return cosmosInstance.getDelegations().pipe(
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  navigateToStake() {
    this.router.navigate([`/details/${this.validatorId}/stake`]);
  }

  navigateToUnStake() {
    this.router.navigate([`/details/${this.validatorId}/unstake`]);
  }
}

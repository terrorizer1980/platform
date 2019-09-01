import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {CosmosService} from '../services/cosmos.service';
import {BlockatlasValidator} from '@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator';

@Component({
  selector: 'app-delegators',
  templateUrl: './all-delegators.component.html',
  styleUrls: ['./all-delegators.component.scss']
})
export class AllDelegatorsComponent {

  blockchain = '';
  validators$: Observable<Array<BlockatlasValidator>> = of([]);

  constructor(activatedRoute: ActivatedRoute, private http: HttpClient, private cosmos: CosmosService, private router: Router) {
    this.blockchain = activatedRoute.snapshot.params.blockchainId;
    if (this.blockchain === 'cosmos') {
      this.validators$ = this.cosmos.getValidatorsFromBlockatlas();
    }
  }

  navigateToMyStakeHoldersList(item: BlockatlasValidator) {
    this.router.navigate([`/details/${item.id}`]);
  }

}

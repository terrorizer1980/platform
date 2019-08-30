import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {from, Observable, of} from 'rxjs';
import {BlockatlasRPC} from '@trustwallet/rpc/lib';
import {BlockatlasValidatorResult} from '@trustwallet/rpc/src/blockatlas/models/BlockatlasValidator';
import {map} from 'rxjs/operators';
import {BlockatlasValidator} from '@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator';
import {CosmosService} from '../services/cosmos.service';
import {blockatlasEndpoint} from '../endpoints';


@Component({
  selector: 'app-delegators',
  templateUrl: './all-delegators.component.html',
  styleUrls: ['./all-delegators.component.scss']
})
export class AllDelegatorsComponent {

  blockchain = '';
  validators$: Observable<Array<BlockatlasValidator>> = of([]);
  blockatlasRpc: BlockatlasRPC;

  constructor( activatedRoute: ActivatedRoute, private http: HttpClient, private cosmos: CosmosService, private router: Router ) {
    this.blockchain = activatedRoute.snapshot.params.blockchainId;
    this.blockatlasRpc = new BlockatlasRPC(blockatlasEndpoint, this.blockchain);
    this.validators$ = from(this.blockatlasRpc.listValidators()).pipe(
      map(( resp: BlockatlasValidatorResult ) => {
        return resp.docs;
      })
    );
  }

  navigateToMyStakeHoldersList( item: BlockatlasValidator ) {
    this.router.navigate([`/details/${item.id}`]);
  }

}

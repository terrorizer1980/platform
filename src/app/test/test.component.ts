import {Component, OnInit} from '@angular/core';
import {TrustProviderService} from '../trust-provider.service';
import {Subscription} from 'rxjs';
import {CosmosService, CosmosServiceInstance} from '../cosmos.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  subscription: Subscription;
  cosmosInstance: CosmosServiceInstance;
  account: string;

  constructor(private trustProvider: TrustProviderService, private cosmos: CosmosService) {
    this.subscription = this.trustProvider.currentAccount$.subscribe((account) => {
      // @ts-ignore
      this.account = account;
      this.cosmosInstance = this.cosmos.getInstance(account);
      //  this.cosmosInstance.getTransactionInfo(this.account).subscribe(( info : any ) => {
      //   // coin : number, addressTo : string, addressFrom : string, amount : string, sequence: string, accountNumber: string
      //   const a = this.trustProvider.transactionSign(
      //     'unstake',
      //     118,
      //     'cosmosvaloper102ruvpv2srmunfffxavttxnhezln6fnc54at8c',
      //     this.account,
      //     '10000',
      //     info.sequence, info.accountNumber
      //   ).then(( r ) => (r))
      // })
    });
  }

  ngOnInit() {
  }

  stake() {
    const tmp = this.cosmosInstance.getTransactionInfo(this.account).subscribe((info: any) => {
      // coin : number, addressTo : string, addressFrom : string, amount : string, sequence: string, accountNumber: string
      const a = this.trustProvider.transactionSign(
        'unstake',
        118,
        'cosmosvaloper102ruvpv2srmunfffxavttxnhezln6fnc54at8c',
        this.account,
        '10000',
        info.sequence, info.accountNumber
      ).then((r) => (r));
    });
  }

  unStake() {
    const tmp = this.cosmosInstance.getTransactionInfo(this.account).subscribe((info: any) => {
      // coin : number, addressTo : string, addressFrom : string, amount : string, sequence: string, accountNumber: string
      const a = this.trustProvider.transactionSign(
        'unstake',
        118,
        'cosmosvaloper102ruvpv2srmunfffxavttxnhezln6fnc54at8c',
        this.account,
        '10000',
        info.sequence, info.accountNumber
      ).then((r) => (r));
    });
  }
}

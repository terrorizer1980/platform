import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {TrustProviderService} from "../trust-provider.service";
import {from, Subscription} from "rxjs";
import {CosmosService, CosmosServiceInstance} from "../cosmos.service";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: "app-test",
  templateUrl: "./test.component.html",
  styleUrls: ["./test.component.scss"],
})
export class TestComponent implements OnInit {
  subscription : Subscription;
  cosmosInstance : CosmosServiceInstance;
  account : string;
  x : any;
  // @ts-ignore
  @ViewChild("input")
  inputElement : ElementRef;


  constructor( private trustProvider : TrustProviderService, private cosmos : CosmosService, private http : HttpClient ) {
    this.subscription = this.trustProvider.currentAccount$.subscribe(( account ) => {
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
    const tmp = this.cosmosInstance.getTransactionInfo(this.account).subscribe(( info : any ) => {
      // coin : number, addressTo : string, addressFrom : string, amount : string, sequence: string, accountNumber: string
      from(this.trustProvider.transactionSign(
        "stake",
        118,
        "cosmosvaloper102ruvpv2srmunfffxavttxnhezln6fnc54at8c",
        this.account,
        "1",
        info.sequence, info.accountNumber,
      )).subscribe(( result ) => {
        this.x = result;
        this.cosmosInstance.broadcastTx(result.substring(9, result.length - 2)).subscribe(( answer ) => {
          alert(answer);
        }, ( err ) => {
          alert(err);
        });
      });

    });
  }
}


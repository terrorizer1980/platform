import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {TrustProviderService} from "../trust-provider.service";
import {Subscription} from "rxjs";
import {CosmosService, CosmosServiceInstance} from "../cosmos.service";
import {HttpClient} from "@angular/common/http";
import {CoinType} from "@trustwallet/types/lib/CoinType";
import {switchMap} from "rxjs/operators";
import {CosmosAccount} from "@trustwallet/rpc/lib";

@Component({
  selector: "app-test",
  templateUrl: "./test.component.html",
  styleUrls: ["./test.component.scss"],
})
export class TestComponent {
  subscription : Subscription;
  cosmosInstance : CosmosServiceInstance;
  account : string;
  showValue : string;
  currentSum : string = "ATOM";
  @ViewChild("input")
  inputElement : ElementRef;

  constructor( private trustProvider : TrustProviderService, private cosmos : CosmosService, private http : HttpClient ) {
    // TODO: fix at service level
    this.subscription = this.trustProvider.currentAccount$
      .subscribe(( account ) => {
        this.account = account;
        this.cosmosInstance = this.cosmos.getInstance(account);
      });
  }

  // calculateAmount() {
  //   this.showValue = this.currentSum == "ATOM" ?
  //     "$" + (this.inputElement.nativeElement.value * 2.64).toFixed(2)
  //     : this.inputElement.nativeElement.value;
  // }

  // swap() {
  //   this.currentSum = this.currentSum != "ATOM" ? "ATOM" : "USD";
  //   this.calculateAmount();
  // }

  stake() {
    // @ts-ignore
    const amount = this.inputElement.nativeElement.value * 1000000;
    this.cosmosInstance.getAccountOnce$(this.account).pipe(
      switchMap(( account : CosmosAccount ) => {
        // const {accountNumber, sequence} = account;
        // TODO: use validator address here
        const addressTo = "cosmosvaloper102ruvpv2srmunfffxavttxnhezln6fnc54at8c";
        return this.trustProvider.signStake(CoinType.cosmos, addressTo, this.account, amount.toString(),
          account.sequence.toString(),
          account.accountNumber.toString(),
        );
      }),
      switchMap(( result ) => {
        const fixedResult = result.substring(9, result.length - 2);
        alert("GOING TO NET");
        return this.cosmosInstance.broadcastTx(fixedResult);
      })).subscribe(
      ( answer ) => {
        alert("YES");
        alert(answer.txhash);
      },
    );
  }

  unStake() {

  }
}


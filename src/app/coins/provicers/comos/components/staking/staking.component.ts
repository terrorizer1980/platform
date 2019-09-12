import { Component, ElementRef, ViewChild } from "@angular/core";
import { Observable, of, ReplaySubject } from "rxjs";
import { CosmosService } from "../../services/cosmos.service";
import { catchError, map, switchMap } from "rxjs/operators";
import { LoadersCSS } from "ngx-loaders-css";
import { ActivatedRoute } from "@angular/router";
import { CosmosAccount } from "@trustwallet/rpc";
import { StakeAction } from "../../../../coin-provider-config";
import { CosmosStakingInfo } from "@trustwallet/rpc/lib/cosmos/models/CosmosStakingInfo";
import { FormBuilder } from "@angular/forms";
import { StakeValidator } from "../../validators/stake.validator";

@Component({
  selector: "app-test",
  templateUrl: "./staking.component.html",
  styleUrls: ["./staking.component.scss"]
})
export class StakingComponent {
  myAddress: Observable<string>;
  validatorId: string;
  info: Observable<CosmosStakingInfo>;
  stakeForm = this.fb.group({
    amount: ["", [], [StakeValidator(true, this.cosmos)]]
  });
  max$ = this.cosmos.getBalance();
  Math = Math;

  loader: LoadersCSS = "ball-beat";
  bgColor = "white";

  constructor(
    private cosmos: CosmosService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.myAddress = this.cosmos.getAddress();
    this.validatorId = activatedRoute.snapshot.params.validatorId;
    this.info = this.cosmos.getStakingInfo();
  }

  stake() {
    const amount = this.stakeForm.get("amount").value * 1000000;
    this.cosmos
      .sendTx(StakeAction.STAKE, this.validatorId, amount.toString())
      .subscribe();
  }

  setMax() {
    const s = this.cosmos.getBalance().subscribe(balance => {
      this.stakeForm.get("amount").setValue(balance);
      s.unsubscribe();
    });
  }
}

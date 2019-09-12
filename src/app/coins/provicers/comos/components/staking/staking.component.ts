import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Observable, of, ReplaySubject } from "rxjs";
import { CosmosService } from "../../services/cosmos.service";
import { catchError, map, switchMap } from "rxjs/operators";
import { LoadersCSS } from "ngx-loaders-css";
import { ActivatedRoute, Router } from "@angular/router";
import { CosmosAccount } from "@trustwallet/rpc";
import { StakeAction } from "../../../../coin-provider-config";
import { CosmosStakingInfo } from "@trustwallet/rpc/lib/cosmos/models/CosmosStakingInfo";
import { FormBuilder, FormGroup } from "@angular/forms";
import { StakeValidator } from "../../validators/stake.validator";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SuccessPopupComponent } from "../success-popup/success-popup.component";

@Component({
  selector: "app-test",
  templateUrl: "./staking.component.html",
  styleUrls: ["./staking.component.scss"]
})
export class StakingComponent {
  myAddress: Observable<string>;
  validatorId: string;
  info: Observable<CosmosStakingInfo>;
  stakeForm: FormGroup;
  max$ = this.cosmos.getBalance();
  Math = Math;

  loader: LoadersCSS = "ball-beat";

  constructor(
    private cosmos: CosmosService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.myAddress = this.cosmos.getAddress();
    this.validatorId = activatedRoute.snapshot.params.validatorId;
    this.info = this.cosmos.getStakingInfo();
    this.stakeForm = this.fb.group({
      amount: ["", [], [StakeValidator(true, this.cosmos, this.validatorId)]]
    });
  }

  stake() {
    const amount = this.stakeForm.get("amount").value * 1000000;
    this.cosmos
      .sendTx(StakeAction.STAKE, this.validatorId, amount.toString())
      .subscribe(_ => {
        this.congratulate(this.stakeForm.get("amount").value);
      });
  }

  setMax() {
    const s = this.cosmos.getBalance().subscribe(balance => {
      this.stakeForm.get("amount").setValue(balance);
      s.unsubscribe();
    });
  }

  congratulate(sum: number) {
    const modalRef = this.modalService.open(SuccessPopupComponent);
    modalRef.componentInstance.text = `You have successfully staked ${sum} ATOMs`;
    modalRef.result.then(
      data => {
        this.router.navigate([`/`]);
      },
      reason => {
        this.router.navigate([`/`]);
      }
    );
  }
}

import { Component } from "@angular/core";
import { Observable, of } from "rxjs";
import { CosmosStakingInfo } from "@trustwallet/rpc/lib/cosmos/models/CosmosStakingInfo";
import { StakeValidator } from "../../validators/stake.validator";
import { LoadersCSS } from "ngx-loaders-css";
import { CosmosService } from "../../services/cosmos.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup } from "@angular/forms";
import { StakeAction } from "../../../../coin-provider-config";
import { SuccessPopupComponent } from "../success-popup/success-popup.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import BigNumber from "bignumber.js";
import { map } from "rxjs/operators";

@Component({
  selector: "app-unstaking",
  templateUrl: "./unstaking.component.html",
  styleUrls: ["./unstaking.component.scss"]
})
export class UnstakingComponent {
  myAddress: Observable<string>;
  validatorId: string;
  info: Observable<CosmosStakingInfo>;
  max$;
  stakeForm: FormGroup;
  Math = Math;

  loader: LoadersCSS = "ball-beat";
  bgColor = "white";

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
    this.max$ = this.cosmos.getStakedToValidator(this.validatorId);
    this.stakeForm = this.fb.group({
      amount: ["", [], [StakeValidator(false, this.cosmos, this.validatorId)]]
    });
  }

  unStake() {
    const amount = this.stakeForm.get("amount").value * 1000000;
    this.cosmos
      .sendTx(StakeAction.UNSTAKE, this.validatorId, amount.toString())
      .subscribe(_ => {
        this.congratulate(this.stakeForm.get("amount").value);
      });
  }

  setMax() {
    const s = this.max$.subscribe(max => {
      this.stakeForm.get("amount").setValue(max);
      s.unsubscribe();
    });
  }

  congratulate(sum: number) {
    const modalRef = this.modalService.open(SuccessPopupComponent);
    modalRef.componentInstance.text = `You have successfully withdrawn ${sum} ATOMs`;
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

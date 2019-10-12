import { Component, EventEmitter, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-withdraw-popup",
  templateUrl: "./withdraw-popup.component.html",
  styleUrls: ["./withdraw-popup.component.scss"]
})
export class WithdrawPopupComponent {
  public image: string;
  public confirmation = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) {
    console.log(321);
  }

  confirm() {
    this.activeModal.close();
    this.confirmation.next();
  }
}

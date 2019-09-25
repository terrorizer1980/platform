import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-logout",
  templateUrl: "./logout.component.html",
  styleUrls: ["./logout.component.scss"]
})
export class LogoutComponent {
  @Output() logout = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) {}

  onLogout() {
    this.logout.next();
    this.activeModal.close();
  }
}

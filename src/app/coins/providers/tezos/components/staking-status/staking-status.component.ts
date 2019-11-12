import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-staking-status",
  templateUrl: "./staking-status.component.html",
  styleUrls: ["./staking-status.component.scss"]
})
export class StakingStatusComponent {
  steps: boolean[] = [false];
  constructor() {}
}

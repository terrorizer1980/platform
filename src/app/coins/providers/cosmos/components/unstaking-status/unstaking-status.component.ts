import { Component } from "@angular/core";

@Component({
  selector: "app-staking-status",
  templateUrl: "./unstaking-status.component.html",
  styleUrls: ["./unstaking-status.component.scss"]
})
export class UnstakingStatusComponent {
  steps: boolean[] = [false, false];
  constructor() {}
}

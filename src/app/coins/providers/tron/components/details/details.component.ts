import { Component } from "@angular/core";
import { map } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { TronService } from "../../services/tron.service";

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"]
})
export class DetailsComponent {
  validatorId = this.activatedRoute.snapshot.params.validatorId;
  additionalInfo = this.tron.getStakingInfo().pipe(
    map(info => [
      {
        name: "Lock Time",
        value: `${info.lockTime} days`
      }
    ])
  );

  constructor(
    public tron: TronService,
    private activatedRoute: ActivatedRoute
  ) {}
}

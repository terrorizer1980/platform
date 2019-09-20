import { Component, Inject } from "@angular/core";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { TronConfigService } from "../../services/tron-config.service";
import { TronProviderConfig } from "../../tron.descriptor";
import { TronService } from "../../services/tron.service";

@Component({
  selector: "app-unstaking",
  templateUrl: "./unstaking.component.html",
  styleUrls: ["./unstaking.component.scss"]
})
export class UnstakingComponent {
  validatorId: string = this.activatedRoute.snapshot.params.validatorId;
  timeFrame = this.tron.getStakingInfo().pipe(map(info => info.lockTime));

  constructor(
    @Inject(TronConfigService)
    public config: Observable<TronProviderConfig>,
    public tron: TronService,
    private activatedRoute: ActivatedRoute
  ) {}
}

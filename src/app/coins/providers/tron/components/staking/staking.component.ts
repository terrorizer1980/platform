import { Component, Inject } from "@angular/core";
import { Observable } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { TronProviderConfig } from "../../tron.descriptor";
import { TronConfigService } from "../../services/tron-config.service";
import { TronService } from "../../services/tron.service";

@Component({
  selector: "app-staking",
  templateUrl: "./staking.component.html",
  styleUrls: ["./staking.component.scss"]
})
export class StakingComponent {
  validatorId: string = this.activatedRoute.snapshot.params.validatorId;

  constructor(
    @Inject(TronConfigService)
    public config: Observable<TronProviderConfig>,
    public tron: TronService,
    private activatedRoute: ActivatedRoute
  ) {}
}

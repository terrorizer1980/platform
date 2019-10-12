import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { RouterDataModule } from "../../../router-data/router-data.module";
import { SharedModule } from "../../../shared/shared.module";
import { RouteDataProvider } from "../../../router-data/services/route-data-provider";
import { CoinTypesInjector } from "../../coin-types-injector";
import { TronProviderRoutingModule } from "./tron-provider-routing.module";
import { TronService } from "./services/tron.service";
import { TronConfigService } from "./services/tron-config.service";
import { TronProviderConfig } from "./tron.descriptor";
import { DetailsComponent } from "./components/details/details.component";
import { StakingComponent } from "./components/staking/staking.component";
import { ReactiveFormsModule } from "@angular/forms";
import { CoinsComponentsModule } from "../../components/coins-components.module";
import { FreezeComponent } from "./components/freeze/freeze.component";
import { WithdrawPopupComponent } from "./components/withdraw-popup/withdraw-popup.component";

@NgModule({
  declarations: [
    DetailsComponent,
    StakingComponent,
    FreezeComponent,
    WithdrawPopupComponent
  ],
  imports: [
    SharedModule,
    RouterDataModule,
    RouterModule,
    TronProviderRoutingModule,
    ReactiveFormsModule,
    CoinsComponentsModule
  ],
  providers: [
    TronService,
    {
      provide: TronConfigService,
      useFactory: function(cInjector, routeProvider) {
        return cInjector.getTypeByProvider(routeProvider);
      },
      deps: [CoinTypesInjector, RouteDataProvider]
    }
  ]
})
export class TronProviderModule {
  constructor(
    private coinTypesInjector: CoinTypesInjector,
    private routeData: RouteDataProvider
  ) {
    routeData.getRouteData<TronProviderConfig>().subscribe(config => {
      coinTypesInjector.addType(config.network, config);
    });
  }
}

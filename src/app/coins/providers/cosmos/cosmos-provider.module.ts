import { DetailsComponent } from "./components/details/details.component";
import { StakingComponent } from "./components/staking/staking.component";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CosmosProviderRoutingModule } from "./cosmos-provider-routing.module";
import { CosmosService } from "./services/cosmos.service";
import { RouterDataModule } from "../../../router-data/router-data.module";
import { SharedModule } from "../../../shared/shared.module";
import { CosmosConfigService } from "./services/cosmos-config.service";
import { RouteDataProvider } from "../../../router-data/services/route-data-provider";
import { CoinTypesInjector } from "../../coin-types-injector";
import { CosmosProviderConfig } from "./cosmos.descriptor";
import { UnstakingComponent } from "./components/unstaking/unstaking.component";
import { CoinsComponentsModule } from "../../components/coins-components.module";

@NgModule({
  declarations: [
    DetailsComponent,
    StakingComponent,
    UnstakingComponent,
  ],
  imports: [
    SharedModule,
    RouterDataModule,
    RouterModule,
    CosmosProviderRoutingModule,
    CoinsComponentsModule
  ],
  providers: [
    CosmosService,
    {
      provide: CosmosConfigService,
      useFactory: function(cInjector, routeProvider) {
        return cInjector.getTypeByProvider(routeProvider);
      },
      deps: [CoinTypesInjector, RouteDataProvider]
    }
  ]
})
export class CosmosProviderModule {
  constructor(
    private coinTypesInjector: CoinTypesInjector,
    private routeData: RouteDataProvider
  ) {
    routeData.getRouteData<CosmosProviderConfig>().subscribe(config => {
      coinTypesInjector.addType(config.network, config);
    });
  }
}

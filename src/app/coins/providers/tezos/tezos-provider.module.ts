import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { RouterDataModule } from "../../../router-data/router-data.module";
import { SharedModule } from "../../../shared/shared.module";
import { RouteDataProvider } from "../../../router-data/services/route-data-provider";
import { CoinTypesInjector } from "../../coin-types-injector";
import { TezosProviderRoutingModule } from "./tezos-provider-routing.module";
import { TezosService } from "./services/tezos.service";
import { TezosConfigService } from "./services/tezos-config.service";
import { TezosProviderConfig } from "./tezos.descriptor";
import { DetailsComponent } from "./components/details/details.component";
import { StakingComponent } from "./components/staking/staking.component";
import { ReactiveFormsModule } from "@angular/forms";
import { CoinsComponentsModule } from "../../components/coins-components.module";

@NgModule({
  declarations: [
    DetailsComponent,
    StakingComponent
  ],
  imports: [
    SharedModule,
    RouterDataModule,
    RouterModule,
    TezosProviderRoutingModule,
    ReactiveFormsModule,
    CoinsComponentsModule
  ],
  providers: [
    TezosService,
    {
      provide: TezosConfigService,
      useFactory: function(cInjector, routeProvider) {
        return cInjector.getTypeByProvider(routeProvider);
      },
      deps: [CoinTypesInjector, RouteDataProvider]
    }
  ]
})
export class TezosProviderModule {
  constructor(
    private coinTypesInjector: CoinTypesInjector,
    private routeData: RouteDataProvider
  ) {
    routeData.getRouteData<TezosProviderConfig>().subscribe(config => {
      coinTypesInjector.addType(config.network, config);
    });
  }
}

import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { MainComponent } from "./core/components/main/main.component";
import {CoinNotSupportedComponent} from "./core/components/coin-not-supported/coin-not-supported.component";

const routes: Routes = [
  {
    path: "",
    component: MainComponent
  },
  {
    path: "coin-not-supported",
    component: CoinNotSupportedComponent
  },
  {
    path: "blockchain",
    loadChildren: () =>
      import("./coins/coins.module").then(mod => mod.CoinsModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

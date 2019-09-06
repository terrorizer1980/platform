import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { Coins } from "./coins";

const routes: Routes = Coins.map(coinDescriptor => ({
  path: coinDescriptor.network,
  loadChildren: coinDescriptor.config.loader,
  data: coinDescriptor
}));

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class CoinsRoutingModule {}

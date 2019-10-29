import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DetailsComponent } from "./components/details/details.component";
import { StakingComponent } from "./components/staking/staking.component";

const routes: Routes = [
  {
    path: "",
    component: DetailsComponent
  },
  {
    path: "stake",
    component: StakingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class TezosProviderRoutingModule {}

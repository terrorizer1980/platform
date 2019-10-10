import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DetailsComponent } from "./components/details/details.component";
import { StakingComponent } from "./components/staking/staking.component";
import { UnstakingComponent } from "./components/unstaking/unstaking.component";

const routes: Routes = [
  {
    path: "",
    component: DetailsComponent
  },
  {
    path: "stake",
    component: StakingComponent
  },
  {
    path: "unstake",
    component: UnstakingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class TronProviderRoutingModule {}

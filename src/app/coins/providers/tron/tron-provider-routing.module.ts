import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DelegatorsComponent } from "./components/delegators/delegators.component";

const routes: Routes = [
  {
    path: "",
    component: DelegatorsComponent
  },
  {
    path: "delegators",
    component: DelegatorsComponent
  },
  {
    path: "details/:validatorId",
    component: null
  },
  {
    path: "details/:validatorId/stake",
    component: null
  },
  {
    path: "details/:validatorId/unstake",
    component: null
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class TronProviderRoutingModule {}

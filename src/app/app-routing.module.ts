import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { MainComponent } from "./main/components/main/main.component";

const routes: Routes = [
  {
    path: "",
    component: MainComponent
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

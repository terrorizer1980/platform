import { NgModule } from "@angular/core";
import { StakingComponent } from "./staking/staking.component";
import { UnstakingComponent } from "./unstaking/unstaking.component";
import { DetailsComponent } from "./details/details.component";
import { ComponentsModule } from "../../shared/components/components.module";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgxLoadersCssModule } from "ngx-loaders-css";
import { ContentLoaderModule } from "@ngneat/content-loader";
import { ReactiveFormsModule } from "@angular/forms";
import { WithdrawDirective } from "./details/directives/withdraw.directive";
import { StakeDirective } from "./details/directives/stake.directive";

const components = [
  StakingComponent,
  UnstakingComponent,
  DetailsComponent,
  WithdrawDirective,
  StakeDirective
];

@NgModule({
  declarations: [...components],
  entryComponents: [],
  imports: [
    CommonModule,
    HttpClientModule,
    NgxLoadersCssModule,
    ContentLoaderModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  exports: [...components]
})
export class CoinsComponentsModule {}

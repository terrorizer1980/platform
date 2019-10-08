import { NgModule } from "@angular/core";
import { DelegatorsComponent } from "./delegators/delegators.component";
import { StakingComponent } from "./staking/staking.component";
import { UnstakingComponent } from "./unstaking/unstaking.component";
import { DetailsComponent } from "./details/details.component";
import { ComponentsModule } from "../../shared/components/components.module";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgxLoadersCssModule } from "ngx-loaders-css";
import { ContentLoaderModule } from "@ngneat/content-loader";
import { ReactiveFormsModule } from "@angular/forms";

const components = [
  DelegatorsComponent,
  StakingComponent,
  UnstakingComponent,
  DetailsComponent
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

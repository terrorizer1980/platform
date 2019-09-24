import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxLoadersCssModule } from "ngx-loaders-css";
import { HttpClientModule } from "@angular/common/http";
import { LoadingButtonComponent } from "./loading-button/loading-button.component";
import { StakePlaceholderComponent } from "./stake-placeholder/stake-placeholder.component";
import { ContentLoaderModule } from "@ngneat/content-loader";
import { ContentPlaceholderComponent } from "./content-placeholder/content-placeholder.component";
import { DelegatorsComponent } from "./delegators/delegators.component";
import { StakingComponent } from "./staking/staking.component";
import { UnstakingComponent } from "./unstaking/unstaking.component";
import { DetailsComponent } from "./details/details.component";
import { ReactiveFormsModule } from "@angular/forms";
import { SelectAuthProviderComponent } from "./select-auth-provider/select-auth-provider.component";

const components = [
  LoadingButtonComponent,
  StakePlaceholderComponent,
  ContentPlaceholderComponent,
  DelegatorsComponent,
  StakingComponent,
  UnstakingComponent,
  DetailsComponent,
  SelectAuthProviderComponent
];

@NgModule({
  declarations: [...components],
  entryComponents: [SelectAuthProviderComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    NgxLoadersCssModule,
    ContentLoaderModule,
    ReactiveFormsModule
  ],
  exports: [...components, ContentLoaderModule]
})
export class ComponentsModule {}

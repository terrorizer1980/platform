import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxLoadersCssModule } from "ngx-loaders-css";
import { HttpClientModule } from "@angular/common/http";
import { LoadingButtonComponent } from "./loading-button/loading-button.component";
import { StakePlaceholderComponent } from "./stake-placeholder/stake-placeholder.component";
import { ContentLoaderModule } from "@ngneat/content-loader";
import { ContentPlaceholderComponent } from "./content-placeholder/content-placeholder.component";

const components = [
  LoadingButtonComponent,
  StakePlaceholderComponent,
  ContentPlaceholderComponent
];

@NgModule({
  declarations: [...components],
  imports: [
    CommonModule,
    HttpClientModule,
    NgxLoadersCssModule,
    ContentLoaderModule
  ],
  exports: [...components, ContentLoaderModule]
})
export class ComponentsModule {}

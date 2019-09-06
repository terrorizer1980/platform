import { BrowserModule } from "@angular/platform-browser";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CoinAccountInfoComponent } from "../../core/components/coin-account-info/coin-account-info.component";
import { CommonModule } from "@angular/common";
import { NgxLoadersCssModule } from "ngx-loaders-css";
import { HttpClientModule } from "@angular/common/http";

const components = [];

@NgModule({
  declarations: [...components],
  imports: [CommonModule, HttpClientModule, NgxLoadersCssModule],
  exports: [...components]
})
export class ComponentsModule {}

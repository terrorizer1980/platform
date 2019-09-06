import { NgModule } from "@angular/core";
import { AppComponent } from "../app.component";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { NgxLoadersCssModule } from "ngx-loaders-css";
import { HttpClientModule } from "@angular/common/http";
import { ComponentsModule } from "./components/components.module";
import { RouterModule } from "@angular/router";

const modules = [
  CommonModule,
  HttpClientModule,
  NgxLoadersCssModule,
  ComponentsModule
];

@NgModule({
  imports: [...modules],
  exports: [...modules],
  providers: []
})
export class SharedModule {}

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxLoadersCssModule } from "ngx-loaders-css";
import { HttpClientModule } from "@angular/common/http";
import { ComponentsModule } from "./components/components.module";
import { AuthModule } from "../auth/auth.module";
import { NgxMaskModule } from "ngx-mask";

const modules = [
  CommonModule,
  HttpClientModule,
  NgxLoadersCssModule,
  ComponentsModule,
  AuthModule,
  NgxMaskModule
];

@NgModule({
  declarations: [],
  entryComponents: [],
  imports: [...modules],
  exports: [...modules],
  providers: []
})
export class SharedModule {}

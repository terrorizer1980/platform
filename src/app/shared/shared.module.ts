import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxLoadersCssModule } from "ngx-loaders-css";
import { HttpClientModule } from "@angular/common/http";
import { ComponentsModule } from "./components/components.module";
import { SuccessPopupComponent } from "./components/success-popup/success-popup.component";
import { ErrorPopupComponent } from "./components/error-popup/error-popup.component";
import { AuthModule } from "../auth/auth.module";
import { ContentDirective } from "./directives/content.directive";
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
  declarations: [SuccessPopupComponent, ErrorPopupComponent, ContentDirective],
  entryComponents: [SuccessPopupComponent, ErrorPopupComponent],
  imports: [...modules],
  exports: [...modules, ContentDirective],
  providers: []
})
export class SharedModule {}

import { NgModule } from "@angular/core";
import { MainComponent } from "./components/main/main.component";
import { RouterDataModule } from "../router-data/router-data.module";
import { SharedModule } from "../shared/shared.module";
import { CoinAccountInfoComponent } from "./components/coin-account-info/coin-account-info.component";
import { BrowserModule } from "@angular/platform-browser";

const components = [CoinAccountInfoComponent];

@NgModule({
  declarations: [MainComponent, ...components],
  imports: [SharedModule, RouterDataModule, BrowserModule],
  exports: [...components],
  providers: []
})
export class CoreModule {}

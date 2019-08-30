import {BrowserModule} from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MainComponent} from './main/main.component';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {StakingComponent} from './staking/staking.component';
import {AccountInfoComponent} from './account-info/account-info.component';
import {AllDelegatorsComponent} from './all-delegators/all-delegators.component';
import {DetailsComponent} from './details/details.component';
import { NgxLoadersCssModule } from 'ngx-loaders-css';

@NgModule({
  declarations: [
    AppComponent,
    AccountInfoComponent,
    MainComponent,
    AllDelegatorsComponent,
    DetailsComponent,
    StakingComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxLoadersCssModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
}

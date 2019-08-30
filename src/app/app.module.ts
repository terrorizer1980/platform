import {BrowserModule} from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MainComponent} from './main/main.component';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {TestComponent} from './test/test.component';
import {AccountInfoComponent} from './account-info/account-info.component';
import {AllDelegatorsComponent} from './all-delegators/all-delegators.component';
import {DetailsComponent} from './details/details.component';

@NgModule({
  declarations: [
    AppComponent,
    AccountInfoComponent,
    MainComponent,
    AllDelegatorsComponent,
    DetailsComponent,
    TestComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
}

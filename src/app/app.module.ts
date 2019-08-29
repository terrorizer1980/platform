import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MainComponent} from './main/main.component';
import {HttpClientModule} from '@angular/common/http';
import {PosDelegatorsComponent} from './pos-delegators/pos-delegators.component';
import {DetailsComponent} from './details/details.component';
import {CommonModule} from '@angular/common';
import {TestComponent} from './test/test.component';
import {AccountInfoComponent} from './account-info/account-info.component';

@NgModule({
  declarations: [
    AppComponent,
    AccountInfoComponent,
    MainComponent,
    PosDelegatorsComponent,
    DetailsComponent,
    TestComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}

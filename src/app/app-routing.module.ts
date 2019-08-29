import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {MainComponent} from './main/main.component';
import {PosDelegatorsComponent} from './pos-delegators/pos-delegators.component';
import {DetailsComponent} from './details/details.component';
import {TestComponent} from './test/test.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainComponent,
  },
  {
    path: 'delegators/:blockchainId',
    component: PosDelegatorsComponent,
  },
  {
    path: 'details/:validatorId',
    component: DetailsComponent,
  },
  {
    path: 'test',
    component: TestComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

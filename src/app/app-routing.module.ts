import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from './main/main.component';
import {TestComponent} from './test/test.component';
import {AllDelegatorsComponent} from './all-delegators/all-delegators.component';
import {DetailsComponent} from './details/details.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  {
    path: 'main',
    component: TestComponent,
  },
  {
    path: 'delegators/:blockchainId',
    component: AllDelegatorsComponent,
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

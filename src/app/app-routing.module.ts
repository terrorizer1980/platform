import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from './main/main.component';
import {StakingComponent} from './staking/staking.component';
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
    component: MainComponent,
  },
  {
    path: 'delegators/:blockchainId',
    component: AllDelegatorsComponent,
  },
  {
    path: 'details/:validatorId',
    component: DetailsComponent,
    pathMatch: 'full',
  },
  {
    path: 'details/:validatorId/:action',
    component: StakingComponent,
  },
  {
    path: 'test',
    component: StakingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

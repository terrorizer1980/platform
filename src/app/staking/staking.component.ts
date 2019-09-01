import { Component, ElementRef, ViewChild } from '@angular/core';
import { stakeOrUntake, TrustProviderService } from '../services/trust-provider.service';
import { of } from 'rxjs';
import { CosmosService } from '../services/cosmos.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LoadersCSS } from 'ngx-loaders-css';
import { AccountService } from '../services/account.service';
import { ActivatedRoute } from '@angular/router';
import { CosmosAccount } from '@trustwallet/rpc/lib';

@Component({
  selector: 'app-test',
  templateUrl: './staking.component.html',
  styleUrls: ['./staking.component.scss'],
})
export class StakingComponent {
  myAddress: string;
  validatorId: string;
  action: string;

  @ViewChild('input')
  inputElement: ElementRef;

  @ViewChild('input2')
  inputElement2: ElementRef;

  loader: LoadersCSS = 'ball-beat';
  bgColor = 'white';
  isLoaded = true;

  constructor(
    private accountService: AccountService,
    private trustProviderService: TrustProviderService,
    private cosmos: CosmosService,
    private activatedRoute: ActivatedRoute) {
    this.myAddress = this.accountService.address;
    this.validatorId = activatedRoute.snapshot.params.validatorId;
    this.action = activatedRoute.snapshot.params.action;
  }

  sendTx(action: stakeOrUntake) {
    const amount = this.inputElement2.nativeElement.value * 1000000;

    this.cosmos.getAccountOnce$(this.myAddress).pipe(
      switchMap((account: CosmosAccount) => {
        this.isLoaded = false;
        const addressTo = this.validatorId;
        return this.trustProviderService.signCosmosStakeAction(action, account, addressTo, amount);
      }),

      map((result) => {
        try {
          return JSON.stringify((JSON.parse(result) as any).json);
        } catch (e) {
          // fix for iOS
          return result.substring(9, result.length - 2);
        }
      }),

      switchMap((result) => {
        return this.cosmos.broadcastTx(result);
      }),

      catchError((error) => {
        alert(JSON.stringify(error));
        return of(error);
      })
    ).subscribe((result) => {
      // alert(result.txhash);
      this.isLoaded = true;
    });
  }

  stake() {
    this.sendTx('stake');
  }

  unStake() {
    this.sendTx('unstake');
  }
}


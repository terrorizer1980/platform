import {Component, ElementRef, ViewChild} from '@angular/core';
import {TrustProviderService} from '../services/trust-provider.service';
import {of, Subscription} from 'rxjs';
import {CosmosService, CosmosServiceInstance} from '../services/cosmos.service';
import {CoinType} from '@trustwallet/types/lib/CoinType';
import {catchError, map, switchMap} from 'rxjs/operators';
import {CosmosAccount} from '@trustwallet/rpc/lib';
import {LoadersCSS} from 'ngx-loaders-css';
import {AccountService} from '../services/account.service';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-test',
    templateUrl: './staking.component.html',
    styleUrls: ['./staking.component.scss'],
})
export class StakingComponent {
    addressSubscription: Subscription;
    cosmosInstanceSubscription: Subscription;
    cosmosInstance: CosmosServiceInstance;
    account: string;
    validatorId: string;
    action: string;

    @ViewChild('input')
    inputElement: ElementRef;

    @ViewChild('input2')
    inputElement2: ElementRef;

    loader: LoadersCSS = 'ball-beat';
    bgColor = 'white';
    color = 'rgb(42,99,160)';
    isLoaded = true;

    constructor(
        private accountService: AccountService,
        private trustProviderService: TrustProviderService,
        private cosmos: CosmosService,
        private activatedRoute: ActivatedRoute ) {

        this.validatorId = activatedRoute.snapshot.params.validatorId;
        this.action = activatedRoute.snapshot.params.action;

        this.addressSubscription = this.accountService.address$
            .subscribe(( account ) => {
                this.account = account;
            });

        this.cosmosInstanceSubscription = this.cosmos.instance$
            .subscribe(( instance ) => {
                this.cosmosInstance = instance;
            });
    }

    stake() {
        const amount = this.inputElement.nativeElement.value * 1000000;
        this.cosmosInstance.getAccountOnce$(this.account).pipe(
            switchMap(( account: CosmosAccount ) => {
                this.isLoaded = false;
                const addressTo = this.validatorId;
                return this.trustProviderService.signStake(CoinType.cosmos, addressTo, this.account, amount.toString(),
                    account.sequence.toString(),
                    account.accountNumber.toString(),
                );
            }),
            map(( result ) => {
                try {
                    alert(JSON.parse((result) as any).json);
                    return JSON.parse((result) as any).json;
                } catch (e) {
                    // fix for iOS
                    return result.substring(9, result.length - 2);
                }
            }),
            switchMap(( result ) => {
                return this.cosmosInstance.broadcastTx(result);
            }),
            catchError(( error ) => {
                alert(JSON.stringify(error));
                return of(error);
            })
        ).subscribe(( result ) => {
            // alert(result.txhash);
            this.isLoaded = true;
        });
    }

    unStake() {
        const amount = this.inputElement2.nativeElement.value * 1000000;
        this.cosmosInstance.getAccountOnce$(this.account).pipe(
            switchMap(( account: CosmosAccount ) => {
                this.isLoaded = false;
                const addressTo = this.validatorId;
                return this.trustProviderService.signUnstake(CoinType.cosmos, addressTo, this.account, amount.toString(),
                    account.sequence.toString(),
                    account.accountNumber.toString(),
                );
            }),
            map(( result ) => {
                try {
                    return JSON.stringify((JSON.parse(result) as any).json);
                } catch (e) {
                    // fix for iOS
                    return result.substring(9, result.length - 2);
                }
            }),
            switchMap(( result ) => {
                return this.cosmosInstance.broadcastTx(result);
            }),
            catchError(( error ) => {
                alert(JSON.stringify(error));
                return of(error);
            })
        ).subscribe(( result ) => {
            // alert(result.txhash);
            this.isLoaded = true;
        });
    }
}


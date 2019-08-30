import {Component, ElementRef, ViewChild} from '@angular/core';
import {TrustProviderService} from '../services/trust-provider.service';
import {of, Subscription} from 'rxjs';
import {CosmosService, CosmosServiceInstance} from '../services/cosmos.service';
import {HttpClient} from '@angular/common/http';
import {CoinType} from '@trustwallet/types/lib/CoinType';
import {catchError, switchMap} from 'rxjs/operators';
import {CosmosAccount} from '@trustwallet/rpc/lib';

import {LoadersCSS} from 'ngx-loaders-css';

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss'],
})
export class TestComponent {
    subscription: Subscription;
    cosmosInstance: CosmosServiceInstance;
    account: string;
    @ViewChild('input')
    inputElement: ElementRef;
    loader: LoadersCSS = 'ball-beat';
    bgColor = 'white';
    color = 'rgb(42,99,160)';
    isLoaded = true;

    constructor( private trustProvider: TrustProviderService, private cosmos: CosmosService, private http: HttpClient ) {
        // TODO: fix at service level
        this.subscription = this.trustProvider.currentAccount$
            .subscribe(( account ) => {
                this.account = account;
                this.cosmosInstance = this.cosmos.getInstance(account);
            });
    }

    stake() {
        // @ts-ignore
        const amount = this.inputElement.nativeElement.value * 1000000;
        this.cosmosInstance.getAccountOnce$(this.account).pipe(
            switchMap(( account: CosmosAccount ) => {
                // const {accountNumber, sequence} = account;
                // TODO: use validator address here
                this.isLoaded = false;
                const addressTo = 'cosmosvaloper102ruvpv2srmunfffxavttxnhezln6fnc54at8c';
                return this.trustProvider.signStake(CoinType.cosmos, addressTo, this.account, amount.toString(),
                    account.sequence.toString(),
                    account.accountNumber.toString(),
                );
            }),
            switchMap(( result ) => {
                const fixedResult = result.substring(9, result.length - 2);
                // alert('GOING TO NET');
                // const url = cosmosEndpoint + '/txs';
                return this.cosmosInstance.broadcastTx(fixedResult);
                // return this.http.post(url, fixedResult);
            }),
            catchError(( error ) => {
                alert('error');
                alert(JSON.stringify(error));
                alert(error);
                return of(error);
            })
        ).subscribe(( result ) => {
            // alert('data');
            alert(JSON.stringify(result));
            alert(result.txhash);
            this.isLoaded = true;
            // alert(result.txhash);
            // alert(JSON.stringify(result));
        });
    }

    unStake() {

    }
}


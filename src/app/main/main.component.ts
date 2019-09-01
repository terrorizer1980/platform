import {combineLatest, Observable, timer} from 'rxjs';
import {IBlockchainDto} from '../dto';
import {Router} from '@angular/router';
import {CosmosService} from '../services/cosmos.service';
import {map, shareReplay, switchMap, switchMapTo, tap} from 'rxjs/operators';
import {Component, OnInit} from '@angular/core';
import {CosmosDelegation} from '@trustwallet/rpc/lib';
import {selectValidatorWithBestInterestRate, toAtom} from '../helpers';
import {BlockatlasValidator} from '@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator';
import {AccountService} from '../services/account.service';


// const MAIN_VIEW_REFRESH_INTERVAL = 10 * 1000; // 60s

interface IAggregatedDelegationMap {
  // TODO: Use BN or native browser BigInt() + polyfill
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-2.html
  [address: string]: number;
}

interface IValidatorWithAmount extends BlockatlasValidator {
  amount: number; // TODO: Use big number or BigInt, show on UI using pipe
}

type StakeHolderList = Array<IValidatorWithAmount>;

function map2List(address2stake: IAggregatedDelegationMap, validators: Array<BlockatlasValidator>): Array<IValidatorWithAmount> {
  return Object.keys(address2stake).map((address) => {
    const validator = validators.find(v => v.id === address);
    return {
      ...validator,
      amount: toAtom(address2stake[address]),
    };
  });
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {

  myStakeHolders$: Observable<StakeHolderList>;

  blockchains: Array<IBlockchainDto> = [
    {
      blockchainId: 'cosmos',
      currencyName: 'Cosmos',
      currencySymbol: 'ATOM',
      bestAnnualRate: undefined,
      iconUri: 'https://assets.trustwalletapp.com/blockchains/cosmos/info/logo.png'
    }
  ];

  constructor(private router: Router, private cosmos: CosmosService, private accountService: AccountService) {
  }

  ngOnInit(): void {

    const validatorsAndDelegations = () => [
      this.cosmos.getValidatorsFromBlockatlas().pipe(
        tap((approvedValidators: BlockatlasValidator[]) => {
          // TODO: used find when we have more than one blockchain
          this.blockchains[0].bestAnnualRate = selectValidatorWithBestInterestRate(approvedValidators);
        })
      ),
      this.cosmos.getAddressDelegations(this.accountService.address)
    ];

    const address2StakeMap$ = () => combineLatest(validatorsAndDelegations()).pipe(
      map((data: any[]) => {
          const approvedValidators: BlockatlasValidator[] = data[0];
          const myDelegations: CosmosDelegation[] = data[1];

          // TODO: double check most probably we no need that check
          if (!approvedValidators || !myDelegations) {
            return [];
          }

          const addresses = approvedValidators.map((d) => d.id);

          // Ignore delegations to validators that isn't in a list of approved validators
          const filteredDelegations = myDelegations.filter((delegation: CosmosDelegation) => {
            // TODO: use map(Object) in case we have more that 10 approved validators
            return addresses.includes(delegation.validatorAddress);
          });

          const address2stakeMap = filteredDelegations.reduce((acc: IAggregatedDelegationMap, delegation: CosmosDelegation) => {
            // TODO: Use BN or native browser BigInt() + polyfill
            const aggregatedAmount = acc[delegation.validatorAddress] || 0;
            const sharesAmount = +(delegation.shares) || 0;
            acc[delegation.validatorAddress] = aggregatedAmount + sharesAmount;
            return acc;
          }, {});

          return map2List(address2stakeMap, approvedValidators);
        }
      ));


    this.myStakeHolders$ = this.accountService.address$.pipe(
      switchMap(() => {
        return address2StakeMap$();
      }),
      // TODO: fix pipeline and support pereodic update, or just use refresh on navigation
      // switchMapTo(
      //   timer(0, MAIN_VIEW_REFRESH_INTERVAL).pipe(
      //     switchMapTo(address2StakeMap$())
      //   )),
      shareReplay(1)
    );

    this.myStakeHolders$.subscribe();
  }

  navigateToPosDelegatorsList(item: IBlockchainDto) {
    this.router.navigate([`/delegators/${item.blockchainId}`]);
  }

  navigateToMyStakeHoldersList(validator: BlockatlasValidator) {
    this.router.navigate([`/details/${validator.id}`]);
  }

}

import { AfterViewInit, Component, Input } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { BlockatlasValidator } from "@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator";
import { ActivatedRoute, Router } from "@angular/router";
import { first, map, switchMap } from "rxjs/operators";
import { CosmosDelegation } from "@trustwallet/rpc/src/cosmos/models/CosmosDelegation";
import { CoinService } from "../../../coins/services/coin.service";

export interface DetailsValidatorInterface {
  validator: BlockatlasValidator;
  stakedSum: string;
  additionals: AdditionalInfo[];
}

export interface AdditionalInfo {
  name: string;
  value: string;
}

@Component({
  selector: "app-shared-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"]
})
export class DetailsComponent implements AfterViewInit {
  @Input() validatorId: string;
  @Input() dataSource: CoinService;
  @Input() additionals: Observable<AdditionalInfo[]>;

  details$: Observable<DetailsValidatorInterface>;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  // Staked amount per validator - we have that
  getStakedAmount(address: string): Observable<string> {
    return this.dataSource.getAddressDelegations(address).pipe(
      map((response: CosmosDelegation[]) => {
        if (!response) {
          return "0";
        }

        const stakedSumArray = [];
        response.forEach((i: CosmosDelegation) => {
          if (i.validatorAddress === this.validatorId) {
            stakedSumArray.push(Number(i.shares) / 1000000);
          }
        });

        return stakedSumArray.reduce((a, b) => a + b, 0).toFixed(6);
      })
    );
  }

  navigateToStake() {
    this.router.navigate([`stake`], { relativeTo: this.activatedRoute });
  }

  navigateToUnStake() {
    this.router.navigate([`unstake`], { relativeTo: this.activatedRoute });
  }

  ngAfterViewInit(): void {
    this.details$ = forkJoin({
      validator: this.dataSource
        .getValidatorsById(this.validatorId)
        .pipe(first()),
      stakedSum: this.dataSource.getAddress().pipe(
        switchMap((address: string) => {
          return this.getStakedAmount(address);
        }),
        first()
      ),
      additionals: this.additionals.pipe(first())
    });
  }
}

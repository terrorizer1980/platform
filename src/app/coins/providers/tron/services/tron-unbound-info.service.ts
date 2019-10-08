import { Injectable } from "@angular/core";
import { combineLatest, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { CoinType } from "@trustwallet/types";
import { fromPromise } from "rxjs/internal-compatibility";
import BigNumber from "bignumber.js";
import { TronRpcService } from "./tron-rpc.service";
import { TronFrozen, TronStakingInfo } from "@trustwallet/rpc/lib";
import { AuthService } from "../../../../auth/services/auth.service";

@Injectable({
  providedIn: "root"
})
export class TronUnboundInfoService {
  constructor(
    private tronRpcService: TronRpcService,
    private authService: AuthService
  ) {}

  getUnbonds(): Observable<TronFrozen[]> {
    return combineLatest([
      this.tronRpcService.rpc,
      this.authService.getAddressFromAuthorized(CoinType.tron)
    ]).pipe(
      switchMap(([rpc, address]) => fromPromise(rpc.listFrozen(address)))
    );
  }

  getReleaseDate(): Observable<Date> {
    return combineLatest([
      this.tronRpcService.rpc,
      this.authService.getAddressFromAuthorized(CoinType.tron)
    ]).pipe(
      switchMap(([rpc, address]) =>
        fromPromise(rpc.unstakingReleaseDate(address))
      )
    );
  }

  getStakingInfo(): Observable<TronStakingInfo> {
    return this.tronRpcService.rpc.pipe(
      switchMap(rpc => fromPromise(rpc.getStakingParameters()))
    );
  }

  getPendingBalance(): Observable<BigNumber> {
    return this.getUnbonds().pipe(
      map(unbounds => {
        try {
          return unbounds.reduce(
            (acc, unbound) => acc.plus(acc.plus(unbound.frozenBalance)),
            new BigNumber(0)
          );
        } catch (e) {
          return new BigNumber(0);
        }
      })
    );
  }

  getRewards(): Observable<BigNumber> {
    return of(new BigNumber(0));
  }
}

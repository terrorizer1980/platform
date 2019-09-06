import { Injectable } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";
import { RouteDataProvider } from "../router-data/services/route-data-provider";
import { CoinProviderConfig } from "./coin-provider-config";
import { first, switchMap } from "rxjs/operators";
import { CoinsModule } from "./coins.module";

@Injectable({ providedIn: CoinsModule })
export class CoinTypesInjector {
  private config: {
    [key: string]: ReplaySubject<any>;
  } = {};

  addType(name: string, config: any) {
    if (!this.config[name]) {
      this.config[name] = new ReplaySubject<any>(1);
    }
    if (name && config) {
      this.config[name].next(config);
    }
  }

  getType<T extends CoinProviderConfig<any>>(name: string): Observable<T> {
    if (!this.config[name]) {
      this.config[name] = new ReplaySubject<T>(1);
    }
    return this.config[name].pipe(first());
  }

  getTypeByProvider<T extends CoinProviderConfig<any>>(
    routeProvider: RouteDataProvider
  ): Observable<T> {
    if (!this.config[name]) {
      this.config[name] = new ReplaySubject<T>(1);
    }
    return routeProvider.getRouteData<T>().pipe(
      switchMap(config => this.config[config.network]),
      first()
    );
  }
}

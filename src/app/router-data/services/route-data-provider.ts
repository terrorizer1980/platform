import { Injectable } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map, switchMap } from "rxjs/operators";

@Injectable()
export class RouteDataProvider {
  private routeData = new ReplaySubject<any>(1);

  constructor(router: Router, activatedRoute: ActivatedRoute) {
    router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === "primary" && !route.fragment["value"]),
        switchMap(route => route.data)
      )
      .subscribe(data => {
        this.routeData.next(data);
      });
  }

  getRouteData<T>(): Observable<T> {
    return this.routeData;
  }
}

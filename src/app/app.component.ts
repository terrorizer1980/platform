import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { Router } from "@angular/router";
import { filter, map, startWith } from "rxjs/operators";
import { Location } from "@angular/common";
import { ServiceFactoryService } from "./shared/services/service-factory.service";
import {
  CosmosService,
  CosmosServiceInjectable
} from "./coins/provicers/comos/services/cosmos.service";
import { CosmosConfigService } from "./coins/provicers/comos/services/cosmos-config.service";
import { environment } from "../environments/environment";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  showBackButton$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private location: Location,
    private si: ServiceFactoryService
  ) {
    // const s = this.si.getService(
    //   CosmosService,
    //   [
    //     {
    //       provide: CosmosConfigService,
    //       useValue: of({
    //         network: "cosmos3",
    //         chainId: "cosmoshub-3",
    //         endpoint: environment.cosmosEndpoint
    //       })
    //     }
    //   ],
    //   CosmosServiceInjectable
    // );

    this.showBackButton$ = this.router.events.pipe(
      filter((event: any) => event.url),
      map((event: any) => event.url !== "/"),
      startWith(false)
    );
  }

  goBack() {
    this.location.back();
  }
}

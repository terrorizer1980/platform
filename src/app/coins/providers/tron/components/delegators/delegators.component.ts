import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { BlockatlasValidator } from "@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { TronService } from "../../services/tron.service";

@Component({
  selector: "app-delegators",
  templateUrl: "./delegators.component.html",
  styleUrls: ["./delegators.component.scss"]
})
export class DelegatorsComponent {
  blockchain = this.activatedRoute.snapshot.params.blockchainId;
  validators$: Observable<
    Array<BlockatlasValidator>
  > = this.tron.getValidators();

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private tron: TronService,
    private router: Router
  ) {}

  select(item: BlockatlasValidator) {
    this.router.navigate([`details/${item.id}`], {
      relativeTo: this.activatedRoute
    });
  }
}

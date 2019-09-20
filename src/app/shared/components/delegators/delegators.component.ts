import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { BlockatlasValidator } from "@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-shared-delegators",
  templateUrl: "./delegators.component.html",
  styleUrls: ["./delegators.component.scss"]
})
export class DelegatorsComponent {
  @Input() blockchain: string;
  @Input() validators$: Observable<Array<BlockatlasValidator>>;
  placeholderValidators = Array(20).fill(0);

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  navigateToMyStakeHoldersList(item: BlockatlasValidator) {
    this.router.navigate([`details/${item.id}`], {
      relativeTo: this.activatedRoute
    });
  }
}

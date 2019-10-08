import { Component, EventEmitter, Input, Output } from "@angular/core";
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
  @Output() select: EventEmitter<BlockatlasValidator> = new EventEmitter<
    BlockatlasValidator
  >();

  constructor() {}

  click(item: BlockatlasValidator) {
    this.select.next(item);
  }
}

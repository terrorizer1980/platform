import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LoadersCSS } from "ngx-loaders-css";

@Component({
  selector: "loading-button",
  templateUrl: "./loading-button.html",
  styleUrls: ["./loading-button.scss"]
})
export class LoadingButtonComponent {
  @Input() loading = false;
  @Input() disabled = false;
  @Output() click: EventEmitter<any> = new EventEmitter();

  loader: LoadersCSS = "ball-beat";
  constructor() {}

  clicked(event: any) {
    this.click.emit(event);
  }
}

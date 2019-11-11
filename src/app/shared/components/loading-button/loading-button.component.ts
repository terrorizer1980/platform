import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output
} from "@angular/core";
import { LoadersCSS } from "ngx-loaders-css";

@Component({
  selector: "loading-button",
  templateUrl: "./loading-button.component.html",
  styleUrls: ["./loading-button.component.scss"]
})
export class LoadingButtonComponent implements AfterViewInit {
  @Input() loading = false;
  @Input() disabled = false;
  @Input() classes: string;
  @Input() spinnerColor: string;
  @Output() action: EventEmitter<any> = new EventEmitter();

  classCondition = {};
  loader: LoadersCSS = "ball-beat";
  constructor() {}

  performAction() {
    if (this.loading || this.disabled) {
      return;
    }

    this.action.emit(null);
  }

  ngAfterViewInit(): void {
    this.classCondition = {
      "btn btn-lg btn-primary w-100": !this.classes,
      [this.classes]: this.classes
    };
  }
}

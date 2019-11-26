import Errors from "../../../../errors.json";
import ErrorsIgnore from "../../../../errors_to_ignore.json";

import { Injectable } from "@angular/core";
import { ErrorModel } from "./error.model";
import { DialogsService } from "../dialogs.service";

export enum IgnoreType {
  display = "display",
  report = "report"
}

@Injectable({
  providedIn: "root"
})
export class ErrorsService {
  constructor(private dialogService: DialogsService) {}

  // TODO: There are raw errors values for each error code now. They gonna be replaced with translation codes in the future
  showError(error: ErrorModel): ErrorModel {
    if (this.isIgnored(error, IgnoreType.display)) {
      console.log(`Ignore error ${JSON.stringify(error)}`);
      return error;
    }

    if (Errors[error.code]) {
      this.dialogService.showError(Errors[error.code]);
      return error;
    } else {
      this.dialogService.showError((Errors as any).default);
    }

    return null;
  }

  isIgnored(error: any, type: IgnoreType): boolean {
    if (error === null || error === undefined) {
      return true;
    }

    const ignored = ErrorsIgnore[type];
    if (typeof error === "string") {
      return ignored.some(err => error === err);
    }

    return ignored.some(err => error.code === err);
  }
}

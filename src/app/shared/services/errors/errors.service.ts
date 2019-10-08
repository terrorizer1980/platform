import Errors from "../../../../errors.json";
import ErrorsIgnore from "../../../../errors_to_ignore.json";

import { Injectable } from "@angular/core";
import { ErrorModel } from "./error.model";
import { DialogsService } from "../dialogs.service";

@Injectable({
  providedIn: "root"
})
export class ErrorsService {
  constructor(private dialogService: DialogsService) {}

  // TODO: There are raw errors values for each error code now. They gonna be replaced with translation codes in the future
  showError(error: ErrorModel): ErrorModel {
    if (Errors[error.code]) {
      this.dialogService.showError(Errors[error.code]);
      return error;
    } else {
      if (
        (typeof error === "string" &&
          (ErrorsIgnore as string[]).some(err => err === error)) ||
        (error && (ErrorsIgnore as string[]).some(err => error.code === err))
      ) {
        console.log(`Ignore error ${JSON.stringify(error)}`);
      } else {
        this.dialogService.showError((Errors as any).default);
        return error;
      }
    }

    return null;
  }
}

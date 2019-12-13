import { ErrorHandler, Injectable, Injector } from "@angular/core";
import {
  ErrorsService,
  IgnoreType
} from "./shared/services/errors/errors.service";
import * as Sentry from "@sentry/browser";
import { environment } from "../environments/environment";

@Injectable({ providedIn: "root" })
export class SentryErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}
  handleError(error: any) {
    if (!this.injector.get(ErrorsService).isIgnored(error, IgnoreType.report)) {
      console.error(`Captured error: ${error}`);
      if (environment.production) {
        Sentry.captureException(error);
      }
    }
  }
}

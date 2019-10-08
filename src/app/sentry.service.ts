import { ErrorHandler, Injectable, Injector } from "@angular/core";
import { ErrorsService } from "./shared/services/errors/errors.service";
import * as Sentry from "@sentry/browser";
import { environment } from "../environments/environment";

@Injectable({ providedIn: "root" })
export class SentryErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}
  handleError(error: Error) {
    if (this.injector.get(ErrorsService).showError(error)) {
      console.error(error);
      if (environment.production) {
        Sentry.captureException(error);
      }
    }
  }
}

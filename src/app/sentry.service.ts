import { ErrorHandler, Injectable, Injector } from "@angular/core";
import { ErrorsService } from "./shared/services/errors/errors.service";
import * as Sentry from "@sentry/browser";
import { CoinNotSupportedException } from "./auth/services/coin-not-supported-exception";
import { Router } from "@angular/router";
import { environment } from "../environments/environment";

@Injectable({ providedIn: "root" })
export class SentryErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}
  handleError(error: Error) {
    console.error(error);
    if (environment.production) {
      const eventId = Sentry.captureException(error);
    }
    // Sentry.showReportDialog({ eventId });
    if (error instanceof CoinNotSupportedException) {
      const result = this.injector
        .get(Router)
        .navigate(["/coin-not-supported"]);
    } else {
      this.injector.get(ErrorsService).showError(error);
    }
  }
}

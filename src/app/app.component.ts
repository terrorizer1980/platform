import { Component, OnDestroy } from "@angular/core";
import { combineLatest, Observable, of, Subscription, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { AuthService } from "./auth/services/auth.service";
import { SelectAuthProviderComponent } from "./shared/components/select-auth-provider/select-auth-provider.component";
import { DialogsService } from "./shared/services/dialogs.service";
import { ErrorsService } from "./shared/services/errors/errors.service";
import { AuthProvider } from "./auth/services/auth-provider";
import { LogoutComponent } from "./shared/components/logout/logout.component";
import { Errors } from "./shared/consts";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnDestroy {
  loggedWith: Observable<AuthProvider> = this.auth
    .getAuthorizedProvider()
    .pipe(catchError(() => of(null)));
  logoutS: Subscription;

  constructor(
    private auth: AuthService,
    private dialogService: DialogsService,
    private errorsService: ErrorsService
  ) {}

  logout() {
    const instance = this.dialogService.showModal(LogoutComponent);
    if (this.logoutS) {
      this.logoutS.unsubscribe();
    }
    this.logoutS = combineLatest([
      this.loggedWith,
      instance.componentInstance.logout
    ])
      .pipe(switchMap(([loggedWith]) => this.auth.logout(loggedWith)))
      .subscribe(() => {
        location.reload();
      });
  }

  connectWallet() {
    const modal = this.dialogService.showModal(SelectAuthProviderComponent, {
      windowClass: "small-popup"
    });
    return modal.componentInstance.select
      .pipe(
        switchMap((provider: AuthProvider) => this.auth.authorize(provider)),
        catchError(error => {
          if (error === "closed") {
            return throwError(Errors.REJECTED_BY_USER);
          }
          return throwError(error);
        })
      )
      .subscribe(
        ([provider]) => {
          location.reload();
        },
        error => {
          this.errorsService.showError(error);
        }
      );
  }

  ngOnDestroy(): void {
    if (this.logoutS) {
      this.logoutS.unsubscribe();
    }
  }
}

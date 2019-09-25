import { Component, OnDestroy } from "@angular/core";
import { combineLatest, Observable, Subscription, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { AuthService } from "./auth/services/auth.service";
import { SelectAuthProviderComponent } from "./shared/components/select-auth-provider/select-auth-provider.component";
import { DialogsService } from "./shared/services/dialogs.service";
import { ErrorsService } from "./shared/services/errors/errors.service";
import { AuthProvider } from "./auth/services/auth-provider";
import { DbService } from "./shared/services/db.service";
import { LogoutComponent } from "./shared/components/logout/logout.component";
import { Errors } from "./shared/consts";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnDestroy {
  loggedWith: Observable<AuthProvider> = this.auth.getAuthorizedProvider();
  logoutS: Subscription;

  constructor(
    private auth: AuthService,
    private dialogService: DialogsService,
    private errorsService: ErrorsService,
    private dbService: DbService
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
      .pipe(switchMap(([loggedWith]) => this.dbService.remove(loggedWith.id)))
      .subscribe(() => {
        location.reload();
      });
  }

  connectWallet() {
    const modal = this.dialogService.showModal(SelectAuthProviderComponent);
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

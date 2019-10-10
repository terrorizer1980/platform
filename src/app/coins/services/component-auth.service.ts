import { Injectable } from "@angular/core";
import { SelectAuthProviderComponent } from "../../shared/components/select-auth-provider/select-auth-provider.component";
import { catchError, switchMap, tap } from "rxjs/operators";
import { AuthProvider } from "../../auth/services/auth-provider";
import { combineLatest, of, throwError } from "rxjs";
import { Errors } from "../../shared/consts";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder } from "@angular/forms";
import { DialogsService } from "../../shared/services/dialogs.service";
import { ErrorsService } from "../../shared/services/errors/errors.service";
import { AuthService } from "../../auth/services/auth.service";
import { CoinType } from "@trustwallet/types";

@Injectable({ providedIn: "root" })
export class ComponentAuthService {
  constructor(
    private dialogService: DialogsService,
    private auth: AuthService
  ) {}
  showAuth(coin: CoinType) {
    const modal = this.dialogService.showModal(SelectAuthProviderComponent);
    return modal.componentInstance.select.pipe(
      switchMap((provider: AuthProvider) =>
        combineLatest([this.auth.authorize(provider), of(provider)])
      ),
      switchMap(([authorized, provider]) =>
        authorized ? provider.getAddress(coin) : throwError("closed")
      ),
      tap(() => {
        location.reload();
      }),
      catchError(error => {
        if (error === "closed") {
          return throwError(Errors.REJECTED_BY_USER);
        }
        return throwError(error);
      })
    );
  }
}

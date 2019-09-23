import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from "../../../auth/services/auth.service";
import { AuthProvider } from "../../../auth/services/auth-provider";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-select-auth-provider",
  templateUrl: "./select-auth-provider.component.html",
  styleUrls: ["./select-auth-provider.component.scss"]
})
export class SelectAuthProviderComponent {
  @Output() select: EventEmitter<AuthProvider> = new EventEmitter<
    AuthProvider
  >();

  providers: Observable<
    AuthProvider[]
  > = this.authService
    .getUnauthorized()
    .pipe(
      map(providers =>
        providers.filter(provider => provider.id !== "trustwallet")
      )
    );
  constructor(
    public activeModal: NgbActiveModal,
    private authService: AuthService
  ) {
    this.activeModal;
  }

  onSelect(provider: AuthProvider) {
    this.select.next(provider);
    this.activeModal.close();
  }

  close(result: string) {
    this.activeModal.close(result);
    this.select.error("closed");
  }
}

import { TrustProvider } from "@trustwallet/provider";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class AuthProviderService {
  constructor() {}

  get isProviderAvailable(): boolean {
    if (environment.production === false) {
      return true;
    }
    return TrustProvider.isAvailable;
  }
}

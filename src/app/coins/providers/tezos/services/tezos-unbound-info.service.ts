import { Injectable } from "@angular/core";
import { TezosRpcService } from "./tezos-rpc.service";
import { AuthService } from "../../../../auth/services/auth.service";

@Injectable({
  providedIn: "root"
})
export class TezosUnboundInfoService {
  constructor(
    private tronRpcService: TezosRpcService,
    private authService: AuthService
  ) {}
}

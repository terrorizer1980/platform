import { TronRPC } from "@trustwallet/rpc";
import { Injectable } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";
import { TronProviderConfig } from "../tron.descriptor";

@Injectable({
  providedIn: "root"
})
export class TronRpcService {
  private _rpc = new ReplaySubject<TronRPC>(1);
  get rpc(): Observable<TronRPC> {
    return this._rpc;
  }

  setConfig(config: Observable<TronProviderConfig>): TronRpcService {
    config.subscribe(cfg => {
      this._rpc.next(new TronRPC(cfg.endpoint));
    });
    return this;
  }
}

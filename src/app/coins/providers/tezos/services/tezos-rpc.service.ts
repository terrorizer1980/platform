import { TezosRPC } from "@trustwallet/rpc";
import { Injectable } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";
import { TezosProviderConfig } from "../tezos.descriptor";

@Injectable({
  providedIn: "root"
})
export class TezosRpcService {
  private _rpc = new ReplaySubject<TezosRPC>(1);
  get rpc(): Observable<TezosRPC> {
    return this._rpc;
  }

  setConfig(config: Observable<TezosProviderConfig>): TezosRpcService {
    config.subscribe(cfg => {
      this._rpc.next(new TezosRPC(cfg.endpoint));
    });
    return this;
  }
}

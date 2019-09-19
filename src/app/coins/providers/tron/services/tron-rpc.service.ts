import { Injectable } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";
import { TronProviderConfig } from "../tron.descriptor";

@Injectable({
  providedIn: "root"
})
export class TronRpcService {
  private _rpc = new ReplaySubject<any>(1);
  get rpc(): Observable<any> {
    return this._rpc;
  }

  setConfig(config: Observable<TronProviderConfig>): TronRpcService {
    // config.subscribe(cfg => {
    //   this._rpc.next(new CosmosRPC(cfg.endpoint));
    // });
    return this;
  }
}

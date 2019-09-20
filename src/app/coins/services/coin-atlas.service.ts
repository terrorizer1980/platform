import { CoinType, CoinTypeUtils } from "@trustwallet/types";
import { from, Observable } from "rxjs";
import { BlockatlasValidator } from "@trustwallet/rpc/src/blockatlas/models/BlockatlasValidator";
import { map } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { BlockatlasRPC, BlockatlasValidatorResult } from "@trustwallet/rpc/lib";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class CoinAtlasService {
  getValidatorsFromBlockatlas(
    coin: CoinType
  ): Observable<BlockatlasValidator[]> {
    return from(
      new BlockatlasRPC(
        environment.blockatlasEndpoint,
        CoinTypeUtils.id(coin)
      ).listValidators()
    ).pipe(
      map((resp: BlockatlasValidatorResult) => {
        return resp.docs;
      })
    );
  }

  getValidatorFromBlockatlasById(
    coin: CoinType,
    validatorId: string
  ): Observable<BlockatlasValidator> {
    return this.getValidatorsFromBlockatlas(coin).pipe(
      map((validators: BlockatlasValidator[]) => {
        return validators.find((validator: BlockatlasValidator) => {
          return validator.id === validatorId;
        });
      })
    );
  }
}

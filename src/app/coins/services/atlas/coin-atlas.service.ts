import { CoinType } from "@trustwallet/types";
import { from, Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import {
  BlockatlasValidator,
  BlockatlasDelegationBatch,
  BlockatlasRPC,
  BlockatlasValidatorResult
} from "@trustwallet/rpc";
import { Injectable } from "@angular/core";
import { ValidatorRequest } from "./validator.request";

@Injectable({ providedIn: "root" })
export class CoinAtlasService {
  private rpc: BlockatlasRPC;

  constructor() {
    this.rpc = new BlockatlasRPC(environment.blockatlasEndpoint);
  }

  getValidatorsFromBlockatlas(
    coin: CoinType
  ): Observable<BlockatlasValidator[]> {
    return from(this.rpc.listValidators(coin)).pipe(
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

  // preparing for the new validators API
  getValidatorsBatch(
    request: ValidatorRequest[]
  ): Observable<BlockatlasDelegationBatch[]> {
    return from(this.rpc.listDelegationsBatch(request)).pipe(
      map(resp => resp.docs),
      catchError(error => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  getDelegations(
    coin: CoinType,
    address: string
  ): Observable<BlockatlasDelegationBatch> {
    return this.getValidatorsBatch([{ coin, address }]).pipe(
      map(batch => {
        if (batch.length === 0) {
          return null;
        }

        return batch[0];
      })
    );
  }
}

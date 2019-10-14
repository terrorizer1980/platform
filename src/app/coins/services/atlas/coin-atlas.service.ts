import { CoinType, CoinTypeUtils } from "@trustwallet/types";
import { from, Observable, throwError } from "rxjs";
import { BlockatlasValidator } from "@trustwallet/rpc/src/blockatlas/models/BlockatlasValidator";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { BlockatlasRPC, BlockatlasValidatorResult } from "@trustwallet/rpc/lib";
import { Injectable } from "@angular/core";
import { ValidatorDelegator, ValidatorModel } from "./validator.model";
import { HttpClient } from "@angular/common/http";
import { ValidatorRequest } from "./validator.request";
import { plainToClass } from "class-transformer";

@Injectable({ providedIn: "root" })
export class CoinAtlasService {
  constructor(private httpClient: HttpClient) {}

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

  // preparing for the new validators API
  getValidatorsInfo(request: ValidatorRequest[]): Observable<ValidatorModel[]> {
    return this.httpClient
      .post(environment.blockatlasEndpoint + "/v2/staking/delegations", request)
      .pipe(
        map((resp: any) => {
          return plainToClass<ValidatorModel, any[]>(ValidatorModel, resp.docs);
        }),
        catchError(error => {
          console.log(error);
          return throwError(error);
        })
      );
  }

  getValidators(request: ValidatorRequest): Observable<ValidatorDelegator[]> {
    return this.getValidatorsInfo([request]).pipe(
      map(validators => {
        const set = new Set<ValidatorDelegator>();
        validators.forEach(validatorModel => {
          validatorModel.delegations.forEach(delegation => {
            set.add(delegation.delegator);
          });
        });
        return Array.from(set);
      })
    );
  }

  getValidatorById(
    request: ValidatorRequest,
    validatorId: string
  ): Observable<ValidatorDelegator> {
    return this.getValidatorsInfo([request]).pipe(
      map(validators => {
        let delegator: ValidatorDelegator;
        validators.forEach(validatorModel => {
          if (!delegator) {
            const found = validatorModel.delegations.find(
              delegation => delegation.delegator.id === validatorId
            );
            if (found) {
              delegator = found.delegator;
            }
          }
        });
        return delegator;
      })
    );
  }
}

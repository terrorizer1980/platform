import { Injectable } from "@angular/core";
import PouchDB from "pouchdb";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import { catchError, first, switchMap } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class DbService {
  db: PouchDB.Database;
  constructor() {
    this.db = new PouchDB(environment.dbName, { auto_compaction: true });
    this.db.info().then(info => {
      console.log(info);
    });
    // this.db.destroy().then();
  }

  get<T>(key: string): Observable<T> {
    return fromPromise(this.db.get(key)).pipe(first()) as Observable<T>;
  }

  getAll(): Observable<any> {
    return fromPromise(this.db.allDocs({ include_docs: true })).pipe(first());
  }

  remove(id: string): Observable<any> {
    return this.get(id).pipe(
      switchMap((doc: any) => fromPromise(this.db.remove(doc)))
    );
  }

  put<T>(key: string, value: T): Observable<T> {
    return (fromPromise(
      this.db.put({
        _id: key,
        ...value
      })
    ).pipe(
      switchMap(_ => this.db.get(key)),
      catchError(_ => this.db.get(key)),
      switchMap(doc => {
        Object.keys(value).forEach(key => {
          doc[key] = value[key];
        });
        return this.db.put(doc);
      })
    ) as unknown) as Observable<T>;
  }
}

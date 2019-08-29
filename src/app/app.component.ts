import {Component} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {distinctUntilChanged, filter, map, shareReplay, startWith} from 'rxjs/operators';
import {Location} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  showBackButton$: Observable<boolean>;

  constructor(private http: HttpClient, private router: Router, private location: Location) {
    this.showBackButton$ = this.router.events.pipe(
      filter((event: any) => event.url),
      map((event: any) => event.url !== '/' && event.url !== '/main'),
      startWith(false),
    );
  }

  goBack() {
    this.location.back();
  }
}


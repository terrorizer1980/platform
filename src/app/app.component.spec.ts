import { async, TestBed } from "@angular/core/testing";
import { AppComponent } from "./app.component";
import { ErrorHandler } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { CoreModule } from "./core/core.module";
import { SharedModule } from "./shared/shared.module";
import { RouterModule } from "@angular/router";
import { BrowserModule } from "@angular/platform-browser";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxMaskModule } from "ngx-mask";
import { SentryErrorHandler } from "./sentry.service";

describe("AppComponent", () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        AppRoutingModule,
        CoreModule,
        SharedModule,
        RouterModule,
        BrowserModule,
        NgbModule,
        NgxMaskModule.forRoot()
      ],
      providers: [{ provide: ErrorHandler, useClass: SentryErrorHandler }]
    }).compileComponents();
  }));

  it(`should build app`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should not show disapointed guy`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});

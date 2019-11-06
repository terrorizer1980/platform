import {
  Component,
  ContentChild,
  Input,
  OnInit,
  TemplateRef
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ContentDirective } from "../../directives/content.directive";
import { SectionDirective } from "../../directives/section.directive";
import { FooterDirective } from "../../directives/footer.directive";

@Component({
  selector: "app-popup",
  templateUrl: "./popup.component.html",
  styleUrls: ["./popup.component.scss"]
})
export class PopupComponent {
  @Input() closable: boolean;

  constructor(public activeModal: NgbActiveModal) {}

  @ContentChild(ContentDirective, { read: TemplateRef, static: false })
  contentTemplate;

  @ContentChild(SectionDirective, { read: TemplateRef, static: false })
  sectionTemplate;

  @ContentChild(FooterDirective, { read: TemplateRef, static: false })
  footerTemplate;
}

import { Component, ContentChild, OnInit, TemplateRef } from "@angular/core";
import { ContentDirective } from "../../directives/content.directive";
import { BlockRightDirective } from "../../directives/block-right.directive";

@Component({
  selector: "app-input",
  templateUrl: "./input.component.html",
  styleUrls: ["./input.component.scss"]
})
export class InputComponent {
  constructor() {}

  @ContentChild(ContentDirective, { read: TemplateRef, static: false })
  contentTemplate;

  @ContentChild(BlockRightDirective, { read: TemplateRef, static: false })
  rightTemplate;
}

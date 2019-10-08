import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef
} from "@angular/core";
import { ContentDirective } from "../../directives/content.directive";
import { Observable } from "rxjs";
import { PlaceholderDirective } from "../../directives/placeholder.directive";
import { ItemDirective } from "../../directives/item.directive";
import { NoItemsDirective } from "../../directives/no-items.directive";

@Component({
  selector: "app-listview",
  templateUrl: "./listview.component.html",
  styleUrls: ["./listview.component.scss"]
})
export class ListviewComponent implements AfterViewInit {
  @Input() header: string;
  @Input() placeholdersCount: number;
  @Input() dataSource: Observable<any[]>;
  @Input() custmized: boolean;
  @Output() select = new EventEmitter();

  placeholders: any[] = [];

  @ContentChild(ItemDirective, { read: TemplateRef, static: false })
  itemTemplate;
  @ContentChild(NoItemsDirective, { read: TemplateRef, static: false })
  noItemTemplate;
  @ContentChild(PlaceholderDirective, { read: TemplateRef, static: false })
  placeholderTemplate;

  constructor(private cdref: ChangeDetectorRef) {}

  click(item: any) {
    this.select.next(item);
  }

  ngAfterViewInit(): void {
    this.placeholders.length = this.placeholdersCount;
    this.placeholders.fill(0, 0, this.placeholdersCount);
    this.custmized = this.custmized === undefined ? true : this.custmized;
    this.cdref.detectChanges();
  }
}

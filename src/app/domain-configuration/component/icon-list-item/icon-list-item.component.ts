import {Component, Input, OnInit} from '@angular/core';
import {IconListItem} from "../../domain/iconListItem";

@Component({
  selector: 'app-icon-list-item',
  templateUrl: './icon-list-item.component.html',
  styleUrls: ['./icon-list-item.component.scss']
})
export class IconListItemComponent implements OnInit {

  @Input()
  icon: IconListItem = {name: "", isWorkObject: false, isActor: false, svg: ""};

  constructor() { }

  ngOnInit(): void {
  }

}

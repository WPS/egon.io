import { Component, Input, OnInit } from '@angular/core';
import { IconListItem } from '../../domain/iconListItem';

@Component({
  selector: 'app-details-list-item',
  templateUrl: './details-list-item.component.html',
  styleUrls: ['./details-list-item.component.scss'],
})
export class DetailsListItemComponent implements OnInit {
  @Input()
  // @ts-ignore
  icon: IconListItem;

  ngOnInit(): void {}
}

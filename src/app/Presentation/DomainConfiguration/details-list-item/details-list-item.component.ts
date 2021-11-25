import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {IconListItem} from '../../../Domain/Domain-Configuration/iconListItem';

@Component({
  selector: 'app-details-list-item',
  templateUrl: './details-list-item.component.html',
  styleUrls: ['./details-list-item.component.scss'],
})
export class DetailsListItemComponent implements AfterViewInit {
  @Input()
    // @ts-ignore
  icon: IconListItem;

  ngAfterViewInit() {
    this.createIcon();
  }

  get id() {
    return (
      'domain-configuration-details-icon-' +
      this.icon.name.toLowerCase() +
      '-' +
      (this.icon.isWorkObject ? 'workobject' : 'actor')
    );
  }

  get name(): string {
    return this.icon.name;
  }

  private createIcon(): void {
    const img = document.getElementById(this.id) as HTMLImageElement;
    img.src = '' + this.icon.svg;
  }
}

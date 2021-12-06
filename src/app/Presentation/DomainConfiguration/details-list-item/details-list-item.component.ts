import { AfterViewChecked, Component, Input } from '@angular/core';
import { IconListItem } from '../../../Domain/Domain-Configuration/iconListItem';

@Component({
  selector: 'app-details-list-item',
  templateUrl: './details-list-item.component.html',
  styleUrls: ['./details-list-item.component.scss'],
})
export class DetailsListItemComponent implements AfterViewChecked {
  @Input()
  // @ts-ignore
  icon: IconListItem;

  private iconInitiated = false;

  get id(): string {
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

  ngAfterViewChecked(): void {
    this.createIcon();
  }

  private createIcon(): void {
    const img = document.getElementById(this.id) as HTMLImageElement;
    if (img && !this.iconInitiated) {
      img.src = '' + this.icon.svg;
      this.iconInitiated = true;
    }
  }
}

import { AfterViewChecked, Component, Input } from '@angular/core';
import { SelectableIcon } from '../../domain/selectableIcon';

import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-selected-icon',
  templateUrl: './selected-icon.component.html',
  styleUrls: ['./selected-icon.component.scss'],

  imports: [MatFormFieldModule],
})
export class SelectedIconComponent implements AfterViewChecked {
  @Input()
  icon!: SelectableIcon;

  private iconInitiated = false;

  get id(): string {
    return (
      'domain-configuration-details-icon-' +
      this.icon.name.toLowerCase() +
      '-' +
      (this.icon.isWorkObject ? 'workObject' : 'actor')
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { SelectedIconComponent } from './selected-icon/selected-icon.component';
import { IconListItemComponent } from './icon-list-item/icon-list-item.component';
import { IconSetConfigurationComponent } from './icon-set-configuration/icon-set-configuration.component';
import { IconSetComponent } from './icon-set/icon-set.component';

@NgModule({
  declarations: [
    SelectedIconComponent,
    IconListItemComponent,
    IconSetConfigurationComponent,
    IconSetComponent,
  ],
  exports: [
    SelectedIconComponent,
    IconListItemComponent,
    IconSetConfigurationComponent,
    IconSetComponent,
  ],
  imports: [CommonModule, MaterialModule],
})
export class IconSetConfigModule {}

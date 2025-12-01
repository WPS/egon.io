import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { SelectedIconComponent } from './selected-icon/selected-icon.component';
import { IconListItemComponent } from './icon-list-item/icon-list-item.component';
import { IconSetConfigurationComponent } from './icon-set-configuration/icon-set-configuration.component';
import { IconSetDetailsComponent } from './icon-set-details/icon-set-details.component';

@NgModule({
  declarations: [
    SelectedIconComponent,
    IconListItemComponent,
    IconSetConfigurationComponent,
    IconSetDetailsComponent,
  ],
  exports: [
    SelectedIconComponent,
    IconListItemComponent,
    IconSetConfigurationComponent,
    IconSetDetailsComponent,
  ],
  imports: [CommonModule, MaterialModule],
})
export class IconSetConfigModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { DetailsListItemComponent } from './details-list-item/details-list-item.component';
import { IconListItemComponent } from './icon-list-item/icon-list-item.component';
import { IconSetConfigurationComponent } from './icon-set-configuration/icon-set-configuration.component';
import { IconSetDetailsComponent } from './icon-set-details/icon-set-details.component';

@NgModule({
  declarations: [
    DetailsListItemComponent,
    IconListItemComponent,
    IconSetConfigurationComponent,
    IconSetDetailsComponent,
  ],
  exports: [
    DetailsListItemComponent,
    IconListItemComponent,
    IconSetConfigurationComponent,
    IconSetDetailsComponent,
  ],
  imports: [CommonModule, MaterialModule],
})
export class IconSetConfigModule {}

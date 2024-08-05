import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconSetConfigurationComponent } from 'src/app/tool/icon-set-config/presentation/icon-set-configuration/icon-set-configuration.component';
import { IconListItemComponent } from '../../../tool/icon-set-config/presentation/icon-list-item/icon-list-item.component';
import { DetailsListItemComponent } from '../../../tool/icon-set-config/presentation/details-list-item/details-list-item.component';
import { IconSetDetailsComponent } from '../../../tool/icon-set-config/presentation/icon-set-details/icon-set-details.component';
import { GeneralSettingsComponent } from './general/general-settings.component';
import { LabelDictionaryComponent } from '../../../tool/label-dictionary/presentation/label-dictionary/label-dictionary.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { AutosaveSettingsModule } from '../../../tool/autosave/autosave-settings.module';

@NgModule({
  declarations: [
    IconSetConfigurationComponent,
    GeneralSettingsComponent,
    LabelDictionaryComponent,
    IconListItemComponent,
    DetailsListItemComponent,
    IconSetDetailsComponent,
  ],
  exports: [
    GeneralSettingsComponent,
    IconSetConfigurationComponent,
    LabelDictionaryComponent,
  ],
  imports: [AutosaveSettingsModule, CommonModule, FormsModule, MaterialModule],
})
export class SettingsModule {}
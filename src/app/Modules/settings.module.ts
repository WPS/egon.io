import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconSetConfigurationComponent } from 'src/app/Presentation/IconSetConfiguration/icon-set-configuration.component';
import { IconListItemComponent } from '../Presentation/IconSetConfiguration/icon-list-item/icon-list-item.component';
import { DetailsListItemComponent } from '../Presentation/IconSetConfiguration/details-list-item/details-list-item.component';
import { IconSetDetailsComponent } from '../Presentation/IconSetConfiguration/icon-set-details/icon-set-details.component';
import { GeneralSettingsComponent } from '../Presentation/Settings/General/general-settings.component';
import { LabelDictionaryComponent } from '../tool/label-dictionary/presentation/label-dictionary/label-dictionary.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { AutosaveSettingsModule } from './autosave-settings.module';

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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconSetConfigurationComponent } from 'src/app/Presentation/DomainConfiguration/icon-set-configuration.component';
import { IconListItemComponent } from '../Presentation/DomainConfiguration/icon-list-item/icon-list-item.component';
import { DetailsListItemComponent } from '../Presentation/DomainConfiguration/details-list-item/details-list-item.component';
import { IconSetDetailsComponent } from '../Presentation/DomainConfiguration/icon-set-details/icon-set-details.component';
import { GeneralSettingsComponent } from '../Presentation/Settings/General/general-settings.component';
import { LabelDictionaryComponent } from '../Presentation/LabelDictionary/label-dictionary.component';
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

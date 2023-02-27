import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainConfigurationComponent } from 'src/app/Presentation/DomainConfiguration/domain-configuration.component';
import { AutosaveSettingsComponent } from '../Presentation/AutosaveSettings/autosave-settings.component';
import { IconListItemComponent } from '../Presentation/DomainConfiguration/icon-list-item/icon-list-item.component';
import { DetailsListItemComponent } from '../Presentation/DomainConfiguration/details-list-item/details-list-item.component';
import { DomainDetailsComponent } from '../Presentation/DomainConfiguration/domain-details/domain-details.component';
import { GeneralSettingsComponent } from '../Presentation/Settings/General/general-settings.component';
import { LabelDictionaryComponent } from '../Presentation/LabelDictionary/label-dictionary.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';

@NgModule({
  declarations: [
    DomainConfigurationComponent,
    GeneralSettingsComponent,
    LabelDictionaryComponent,
    AutosaveSettingsComponent,
    IconListItemComponent,
    DetailsListItemComponent,
    DomainDetailsComponent,
  ],
  exports: [
    AutosaveSettingsComponent,
    GeneralSettingsComponent,
    DomainConfigurationComponent,
    LabelDictionaryComponent,
  ],
  imports: [CommonModule, FormsModule, MaterialModule],
})
export class SettingsModule {}

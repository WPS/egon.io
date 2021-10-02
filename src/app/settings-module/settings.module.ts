import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainConfigurationComponent } from 'src/app/domain-configuration/component/domain-configuration.component';
import { GeneralSettingsComponent } from 'src/app/general-settings/component/general-settings.component';
import { LabelDictionaryComponent } from 'src/app/label-dictionary/component/label-dictionary.component';
import { AutosaveSettingsComponent } from '../autosave/autosave-settings-component/autosave-settings.component';

@NgModule({
  declarations: [
    DomainConfigurationComponent,
    GeneralSettingsComponent,
    LabelDictionaryComponent,
    AutosaveSettingsComponent,
  ],
  exports: [
    AutosaveSettingsComponent,
    GeneralSettingsComponent,
    DomainConfigurationComponent,
    LabelDictionaryComponent,
  ],
  imports: [CommonModule],
})
export class SettingsModule {}

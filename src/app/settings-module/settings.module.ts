import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainConfigurationComponent } from 'src/app/domain-configuration/component/domain-configuration.component';
import { GeneralSettingsComponent } from 'src/app/general-settings/component/general-settings.component';
import { LabelDictionaryComponent } from 'src/app/label-dictionary/component/label-dictionary.component';
import { AutosaveSettingsComponent } from '../autosave/autosave-settings-component/autosave-settings.component';
import {MatButtonModule} from "@angular/material/button";
import {MatGridListModule} from "@angular/material/grid-list";
import {IconListItemComponent} from "../domain-configuration/component/icon-list-item/icon-list-item.component";
import {MatButtonToggleModule} from "@angular/material/button-toggle";

@NgModule({
  declarations: [
    DomainConfigurationComponent,
    GeneralSettingsComponent,
    LabelDictionaryComponent,
    AutosaveSettingsComponent,
    IconListItemComponent,
  ],
  exports: [
    AutosaveSettingsComponent,
    GeneralSettingsComponent,
    DomainConfigurationComponent,
    LabelDictionaryComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatGridListModule,
    MatButtonToggleModule,
  ],
})
export class SettingsModule {}

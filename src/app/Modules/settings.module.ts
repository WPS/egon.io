import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainConfigurationComponent } from 'src/app/Presentation/DomainConfiguration/domain-configuration.component';
import { AutosaveSettingsComponent } from '../Presentation/AutosaveSettings/autosave-settings.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatGridListModule } from '@angular/material/grid-list';
import { IconListItemComponent } from '../Presentation/DomainConfiguration/icon-list-item/icon-list-item.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { DetailsListItemComponent } from '../Presentation/DomainConfiguration/details-list-item/details-list-item.component';
import { DomainDetailsComponent } from '../Presentation/DomainConfiguration/domain-details/domain-details.component';
import { GeneralSettingsComponent } from '../Presentation/Settings/General/general-settings.component';
import { LabelDictionaryComponent } from '../Presentation/LabelDictionary/label-dictionary.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { FormsModule } from '@angular/forms';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatExpansionModule } from '@angular/material/expansion';

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
  imports: [
    CommonModule,
    MatButtonModule,
    MatGridListModule,
    MatButtonToggleModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    FormsModule,
    MatCardModule,
    MatExpansionModule,
  ],
})
export class SettingsModule {}

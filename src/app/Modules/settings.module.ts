import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomainConfigurationComponent } from 'src/app/Presentation/DomainConfiguration/domain-configuration.component';
import { AutosaveSettingsComponent } from '../Presentation/AutosaveSettings/autosave-settings.component';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { IconListItemComponent } from '../Presentation/DomainConfiguration/icon-list-item/icon-list-item.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatListModule } from '@angular/material/list';
import { DetailsListItemComponent } from '../Presentation/DomainConfiguration/details-list-item/details-list-item.component';
import { DomainDetailsComponent } from '../Presentation/DomainConfiguration/domain-details/domain-details.component';
import { GeneralSettingsComponent } from '../Presentation/Settings/General/general-settings.component';
import { LabelDictionaryComponent } from '../Presentation/LabelDictionary/label-dictionary.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
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

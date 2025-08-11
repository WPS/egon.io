import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutosaveSettingsComponent } from './AutosaveSettings/autosave-settings.component';
import { AutosaveOptionsComponent } from './AutosaveOptions/autosave-options.component';
import { AutosavedDraftsComponent } from './AutosavedDrafts/autosaved-drafts.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';

@NgModule({
  declarations: [
    AutosaveSettingsComponent,
    AutosaveOptionsComponent,
    AutosavedDraftsComponent,
  ],
  exports: [AutosaveSettingsComponent],
  imports: [CommonModule, FormsModule, MaterialModule],
})
export class AutosaveModule {}

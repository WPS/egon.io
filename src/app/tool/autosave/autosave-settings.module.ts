import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutosaveSettingsComponent } from './presentation/AutosaveSettings/autosave-settings.component';
import { AutosaveOptionsComponent } from './presentation/AutosaveOptions/autosave-options.component';
import { AutosavedDraftsComponent } from './presentation/AutosavedDrafts/autosaved-drafts.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../workbench/material.module';

@NgModule({
  declarations: [
    AutosaveSettingsComponent,
    AutosaveOptionsComponent,
    AutosavedDraftsComponent,
  ],
  exports: [AutosaveSettingsComponent],
  imports: [CommonModule, FormsModule, MaterialModule],
})
export class AutosaveSettingsModule {}

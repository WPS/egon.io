import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutosaveSettingsComponent } from '../tool/autosave/presentation/AutosaveSettings/autosave-settings.component';
import { AutosaveOptionsComponent } from '../tool/autosave/presentation/AutosaveOptions/autosave-options.component';
import { AutosavedDraftsComponent } from '../tool/autosave/presentation/AutosavedDrafts/autosaved-drafts.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';

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

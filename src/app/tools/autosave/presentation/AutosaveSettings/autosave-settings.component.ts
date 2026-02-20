import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { AutosaveOptionsComponent } from '../AutosaveOptions/autosave-options.component';
import { AutosavedDraftsComponent } from '../AutosavedDrafts/autosaved-drafts.component';

@Component({
  selector: 'app-autosave-settings',
  templateUrl: './autosave-settings.component.html',
  styleUrls: ['./autosave-settings.component.scss'],
  standalone: true,
  imports: [CommonModule, AutosaveOptionsComponent, AutosavedDraftsComponent],
})
export class AutosaveSettingsComponent {}

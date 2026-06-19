import { Component } from '@angular/core';

import { AutosaveOptionsComponent } from '../AutosaveOptions/autosave-options.component';
import { AutosavedDraftsComponent } from '../AutosavedDrafts/autosaved-drafts.component';

@Component({
  selector: 'app-autosave-settings',
  templateUrl: './autosave-settings.component.html',
  styleUrls: ['./autosave-settings.component.scss'],

  imports: [AutosaveOptionsComponent, AutosavedDraftsComponent],
})
export class AutosaveSettingsComponent {}

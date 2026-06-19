import { Component, inject, signal } from '@angular/core';
import { SettingsService } from 'src/app/workbench/services/settings/settings.service';
import { ModelerService } from 'src/app/tools/modeler/services/modeler.service';
import { IconSetCustomizationService } from '../../../tools/icon-set-config/services/icon-set-customization.service';
import { IconSet } from '../../../domain/entities/iconSet';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AutosaveSettingsComponent } from '../../../tools/autosave/presentation/AutosaveSettings/autosave-settings.component';
import { IconSetConfigurationComponent } from '../../../tools/icon-set-config/presentation/icon-set-configuration/icon-set-configuration.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],

  imports: [
    MatToolbarModule,
    MatButtonModule,
    AutosaveSettingsComponent,
    IconSetConfigurationComponent,
  ],
})
export class SettingsComponent {
  iconSetConfiguration: IconSet | undefined;
  readonly showAutosaveSettings = signal(false);
  readonly showIconSetCustomization = signal(true);

  private readonly settingsService = inject(SettingsService);
  private readonly modelerService = inject(ModelerService);
  private readonly iconSetCustomizationService = inject(
    IconSetCustomizationService,
  );

  close(): void {
    const savedConfiguration =
      this.iconSetCustomizationService.getAndClearSavedConfiguration();
    if (savedConfiguration) {
      this.modelerService.restart(savedConfiguration);
    }
    this.settingsService.close();
  }

  openGeneralSettings() {
    this.showAutosaveSettings.set(true);
    this.showIconSetCustomization.set(false);
  }

  openIconSetCustomization() {
    this.showAutosaveSettings.set(false);
    this.showIconSetCustomization.set(true);
  }
}

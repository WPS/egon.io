import { Component } from '@angular/core';
import { SettingsService } from 'src/app/workbench/services/settings/settings.service';
import { ModelerService } from 'src/app/tools/modeler/services/modeler.service';
import { IconSetConfiguration } from 'src/app/domain/entities/iconSetConfiguration';
import { BehaviorSubject, Observable } from 'rxjs';
import { AutosaveConfigurationService } from '../../../tools/autosave/services/autosave-configuration.service';
import { IconSetCustomizationService } from '../../../tools/icon-set-config/services/icon-set-customization.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  iconSetConfiguration: IconSetConfiguration | undefined;
  showGeneralSettings = new BehaviorSubject<boolean>(false);
  showIconSetCustomization = new BehaviorSubject<boolean>(true);

  constructor(
    private settingsService: SettingsService,
    private modelerService: ModelerService,
    private iconSetCustomizationService: IconSetCustomizationService,
  ) {}

  close(): void {
    const savedConfiguration =
      this.iconSetCustomizationService.getAndClearSavedConfiguration();
    if (savedConfiguration) {
      this.modelerService.restart(savedConfiguration);
    }
    this.settingsService.close();
  }

  openGeneralSettings() {
    this.showGeneralSettings.next(true);
    this.showIconSetCustomization.next(false);
  }

  openIconSetCustomization() {
    this.showGeneralSettings.next(false);
    this.showIconSetCustomization.next(true);
  }
}

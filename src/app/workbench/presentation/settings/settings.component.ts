import { Component } from '@angular/core';
import { SettingsService } from 'src/app/workbench/services/settings/settings.service';
import { ModelerService } from 'src/app/tools/modeler/services/modeler.service';
import { BehaviorSubject } from 'rxjs';
import { IconSetCustomizationService } from '../../../tools/icon-set-config/services/icon-set-customization.service';
import { IconSet } from '../../../domain/entities/iconSet';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: false,
})
export class SettingsComponent {
  iconSetConfiguration: IconSet | undefined;
  showAutosaveSettings = new BehaviorSubject<boolean>(false);
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
    this.showAutosaveSettings.next(true);
    this.showIconSetCustomization.next(false);
  }

  openIconSetCustomization() {
    this.showAutosaveSettings.next(false);
    this.showIconSetCustomization.next(true);
  }
}

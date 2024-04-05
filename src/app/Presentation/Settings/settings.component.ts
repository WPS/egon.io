import { Component } from '@angular/core';
import { SettingsService } from 'src/app/Service/Settings/settings.service';
import { ModelerService } from 'src/app/Service/Modeler/modeler.service';
import { IconSetConfiguration } from 'src/app/Domain/Common/iconSetConfiguration';
import { BehaviorSubject, Observable } from 'rxjs';
import { AutosaveConfigurationService } from '../../Service/Autosave/autosave-configuration.service';
import { IconSetCustomizationService } from '../../Service/IconSetConfiguration/icon-set-customization.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  domainConfiguration: IconSetConfiguration | undefined;
  showGeneralSettings = new BehaviorSubject<boolean>(false);
  showDomainCustomization = new BehaviorSubject<boolean>(true);

  constructor(
    private settingsService: SettingsService,
    private modelerService: ModelerService,
    private domainCustomizationService: IconSetCustomizationService,
  ) {}

  close(): void {
    const savedConfiguration =
      this.domainCustomizationService.getAndClearSavedConfiguration();
    if (savedConfiguration) {
      this.modelerService.restart(savedConfiguration);
    }
    this.settingsService.close();
  }

  openGeneralSettings() {
    this.showGeneralSettings.next(true);
    this.showDomainCustomization.next(false);
  }

  openDomainCustomization() {
    this.showGeneralSettings.next(false);
    this.showDomainCustomization.next(true);
  }
}

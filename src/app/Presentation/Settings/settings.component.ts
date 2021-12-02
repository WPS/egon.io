import {Component, OnInit} from '@angular/core';
import {SettingsService} from 'src/app/Service/Settings/settings.service';
import {ModelerService} from 'src/app/Service/Modeler/modeler.service';
import {DomainConfiguration} from 'src/app/Domain/Common/domainConfiguration';
import {BehaviorSubject, Observable} from 'rxjs';
import {AutosaveStateService} from '../../Service/Autosave/autosave-state.service';
import {DomainCustomizationService} from '../../Service/DomainConfiguration/domain-customization.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  configurationChanged = false;
  domainConfiguration: DomainConfiguration | undefined;
  autosaveEnable: Observable<boolean>;
  showGeneralSettings = new BehaviorSubject<boolean>(false);
  showDomainCustomization = new BehaviorSubject<boolean>(true);

  constructor(
    private settingsService: SettingsService,
    private modelerService: ModelerService,
    private autosaveStateService: AutosaveStateService,
    private domainCustomizationService: DomainCustomizationService
  ) {
    this.autosaveEnable = autosaveStateService.getAutosaveStateAsObservable();
  }

  ngOnInit(): void {
  }

  close(): void {
    const savedConfiguration =
      this.domainCustomizationService.getSavedConfiguration();
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

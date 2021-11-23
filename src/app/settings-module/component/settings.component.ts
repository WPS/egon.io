import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SettingsService } from 'src/app/settings-module/service/settings.service';
import { ModelerService } from 'src/app/modeler/service/modeler.service';
import { DomainConfiguration } from 'src/app/common/domain/domainConfiguration';
import { Observable } from 'rxjs';
import { AutosaveStateService } from '../../autosave/service/autosave-state.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  configurationChanged = false;
  domainConfiguration: DomainConfiguration | undefined;
  autosaveEnable: Observable<boolean>;

  @Output()
  emitIconConfigurationExport = new EventEmitter<boolean>();
  @Output()
  emitIconConfigurationImport = new EventEmitter<boolean>();

  constructor(
    private settingsService: SettingsService,
    private modelerService: ModelerService,
    private autosaveStateService: AutosaveStateService
  ) {
    this.autosaveEnable = autosaveStateService.getAutosaveStateAsObservable();
  }

  ngOnInit(): void {}

  close(): void {
    if (this.configurationChanged) {
      this.modelerService.restart(this.domainConfiguration);
    }
    this.settingsService.close();
  }

  importIconConfig(): void {
    this.emitIconConfigurationImport.emit(true);
  }

  exportIconConfig(): void {
    this.emitIconConfigurationExport.emit(true);
  }
}

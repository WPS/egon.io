import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { StorageService } from '../BrowserStorage/storage.service';
import { AutosaveConfiguration } from '../../Domain/Autosave/autosave-configuration';
import {
  DEFAULT_AUTOSAVES_AMOUNT,
  DEFAULT_AUTOSAVES_ENABLED,
  DEFAULT_AUTOSAVES_INTERVAL,
} from 'src/app/Domain/Common/constants';

const AUTOSAVE_CONFIGURATION_TAG = 'autosaveConfiguration';

const defaultConfiguration: AutosaveConfiguration = {
  activated: DEFAULT_AUTOSAVES_ENABLED,
  interval: DEFAULT_AUTOSAVES_INTERVAL,
  amount: DEFAULT_AUTOSAVES_AMOUNT,
};

@Injectable({
  providedIn: 'root',
})
export class AutosaveConfigurationService {
  private configuration = defaultConfiguration;

  private readonly configurationSubject =
    new ReplaySubject<AutosaveConfiguration>(1);
  readonly configuration$ = this.configurationSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.initializeConfiguration();
  }

  private initializeConfiguration() {
    this.loadConfiguration();
    this.configurationSubject.next(this.configuration);
  }

  setConfiguration(configuration: AutosaveConfiguration): boolean {
    try {
      this.configuration = configuration;
      this.saveConfiguration();
      this.configurationSubject.next(configuration);
      return true;
    } catch {
      return false;
    }
  }

  private loadConfiguration() {
    this.configuration =
      this.storageService.get(AUTOSAVE_CONFIGURATION_TAG) ??
      defaultConfiguration;
  }

  private saveConfiguration() {
    this.storageService.set(AUTOSAVE_CONFIGURATION_TAG, this.configuration);
  }
}

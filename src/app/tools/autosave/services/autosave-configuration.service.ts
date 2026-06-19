import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { StorageService } from '../../../domain/services/storage.service';
import { AutosaveConfiguration } from '../domain/autosave-configuration';
import {
  DEFAULT_AUTOSAVES_ENABLED,
  DEFAULT_AUTOSAVES_INTERVAL,
  DEFAULT_AUTOSAVES_MAX_DRAFTS,
} from 'src/app/domain/entities/constants';

const AUTOSAVE_CONFIGURATION_TAG = 'autosaveConfiguration';

const defaultConfiguration: AutosaveConfiguration = {
  activated: DEFAULT_AUTOSAVES_ENABLED,
  interval: DEFAULT_AUTOSAVES_INTERVAL,
  maxDrafts: DEFAULT_AUTOSAVES_MAX_DRAFTS,
};

@Injectable({
  providedIn: 'root',
})
export class AutosaveConfigurationService {
  private currentConfiguration = defaultConfiguration;

  readonly configurationSignal: WritableSignal<AutosaveConfiguration> =
    signal(defaultConfiguration);
  readonly configuration = this.configurationSignal.asReadonly();

  private readonly storageService = inject(StorageService);

  constructor() {
    this.initializeConfiguration();
  }

  private initializeConfiguration() {
    this.currentConfiguration =
      this.storageService.get(AUTOSAVE_CONFIGURATION_TAG) ??
      defaultConfiguration;
    this.configurationSignal.set(this.currentConfiguration);
  }

  setConfiguration(configuration: AutosaveConfiguration): boolean {
    try {
      this.currentConfiguration = configuration;
      this.saveConfiguration();
      this.configurationSignal.set(configuration);
      return true;
    } catch {
      return false;
    }
  }

  private saveConfiguration() {
    this.storageService.set(
      AUTOSAVE_CONFIGURATION_TAG,
      this.currentConfiguration,
    );
  }
}

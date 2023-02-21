import { Injectable } from '@angular/core';
import {
  SAVE_STATE_TAG,
  AUTOSAVE_ACTIVATED_TAG,
  AUTOSAVE_AMOUNT_TAG,
  AUTOSAVE_INTERVAL_TAG,
  AUTOSAVE_TAG,
  DOMAIN_CONFIGURATION_TAG,
  MAX_AUTOSAVES,
} from '../../Domain/Common/constants';
import { Autosave } from '../../Domain/Autosave/autosave';
import { Autosaves } from '../../Domain/Autosave/autosaves';
import {
  DomainConfiguration,
  fromConfigurationFromFile,
} from '../../Domain/Common/domainConfiguration';
import { SaveState } from '../../Domain/Autosave/saveState';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  setAutosaveEnabled(enabled: boolean): void {
    localStorage.setItem(AUTOSAVE_ACTIVATED_TAG, JSON.stringify(enabled, null, 2));
  }

  getAutosaveEnabled() {
    return JSON.parse(localStorage.getItem(AUTOSAVE_ACTIVATED_TAG) || 'false');
  }

  getMaxAutosaves(): number {
    return Number(localStorage.getItem(AUTOSAVE_AMOUNT_TAG) || MAX_AUTOSAVES);
  }

  setMaxAutosaves(amount: number): void {
    localStorage.setItem(AUTOSAVE_AMOUNT_TAG, '' + amount);
  }

  setAutosaves(currentAutosaves: Autosave[]): void {
    localStorage.setItem(
      AUTOSAVE_TAG,
      JSON.stringify({ autosaves: currentAutosaves }, null, 2)
    );
  }

  getAutosaves(): Autosave[] {
    const autosavesString = localStorage.getItem(AUTOSAVE_TAG);
    if (autosavesString) {
      const autosaves = (JSON.parse(autosavesString) as Autosaves).autosaves;
      if (autosaves && autosaves.length > 0) {
        return autosaves;
      }
    }
    return [];
  }

  getAutosaveInterval(): string | null {
    return localStorage.getItem(AUTOSAVE_INTERVAL_TAG);
  }

  setAutosaveInterval(interval: number): void {
    localStorage.setItem(AUTOSAVE_INTERVAL_TAG, '' + interval);
  }

  checkValidityOfConfiguration(configuratioFromFile: DomainConfiguration) {
    return (
      configuratioFromFile.actors.keysArray().length > 1 &&
      configuratioFromFile.workObjects.keysArray().length > 1 &&
      !configuratioFromFile.actors
        .all()
        .some((e) => typeof e.value !== 'string') &&
      !configuratioFromFile.workObjects
        .all()
        .some((e) => typeof e.value !== 'string')
    );
  }

  getStoredDomainConfiguration(): DomainConfiguration | undefined {
    const domainString = localStorage.getItem(DOMAIN_CONFIGURATION_TAG);

    if (!domainString) {
      return;
    } else {
      const configuratioFromFile = fromConfigurationFromFile(
        JSON.parse(domainString)
      );
      if (this.checkValidityOfConfiguration(configuratioFromFile)) {
        return configuratioFromFile;
      }
    }
    return;
  }

  setStoredDomainConfiguration(config: DomainConfiguration): void {
    const actors: {
      [p: string]: any;
    } = {};
    config.actors.keysArray().forEach((key) => {
      actors[key] = config.actors.get(key);
    });
    const workObjects: {
      [p: string]: any;
    } = {};
    config.workObjects.keysArray().forEach((key) => {
      workObjects[key] = config.workObjects.get(key);
    });

    const configForStorage = {
      name: config.name,
      actors: actors,
      workObjects: workObjects,
    };

    localStorage.setItem(
      DOMAIN_CONFIGURATION_TAG,
      JSON.stringify(configForStorage, null, 2)
    );
  }

  setSaveState(saveState: SaveState) {
    localStorage.setItem(SAVE_STATE_TAG, JSON.stringify(saveState));
  }

  getSaveState(): SaveState | undefined {
    const saveStateString = localStorage.getItem(SAVE_STATE_TAG);
    if (saveStateString) {
      return JSON.parse(saveStateString);
    }
    return;
  }

}

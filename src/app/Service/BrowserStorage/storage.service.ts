import { Injectable } from '@angular/core';
import {
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
  fromConfiguratioFromFile,
} from '../../Domain/Common/domainConfiguration';
import { askConfirmation } from '@angular/cli/utilities/prompt';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  setAutosaveEnabled(enabled: boolean): void {
    localStorage.setItem(AUTOSAVE_ACTIVATED_TAG, JSON.stringify(enabled));
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
      JSON.stringify({ autosaves: currentAutosaves })
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

  getSavedDomainConfiguration(): DomainConfiguration | undefined {
    const domainString = localStorage.getItem(DOMAIN_CONFIGURATION_TAG);
    if (!domainString) {
      return;
    } else {
      const configuratioFromFile = fromConfiguratioFromFile(
        JSON.parse(domainString)
      );
      if (
        configuratioFromFile.actors.keysArray().length > 0 &&
        configuratioFromFile.workObjects.keysArray().length > 0
      ) {
        return configuratioFromFile;
      }
      return;
    }
  }

  setSavedDomainConfiguration(config: DomainConfiguration): void {
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
      JSON.stringify(configForStorage)
    );
  }
}

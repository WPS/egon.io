import { Injectable } from '@angular/core';
import { ICON_SET_CONFIGURATION_TAG } from '../entities/common/constants';
import {
  IconSetConfiguration,
  fromConfigurationFromFile,
} from '../entities/iconSetConfiguration';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: string): any {
    const json = localStorage.getItem(key);
    if (json) {
      return JSON.parse(json);
    }
    return null;
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  checkValidityOfConfiguration(configuratioFromFile: IconSetConfiguration) {
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

  getStoredIconSetConfiguration(): IconSetConfiguration | undefined {
    const iconSetString = localStorage.getItem(ICON_SET_CONFIGURATION_TAG);

    if (!iconSetString) {
      return;
    } else {
      const configurationFromFile = fromConfigurationFromFile(
        JSON.parse(iconSetString),
      );
      if (this.checkValidityOfConfiguration(configurationFromFile)) {
        return configurationFromFile;
      }
    }
    return;
  }

  setStoredIconSetConfiguration(config: IconSetConfiguration): void {
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
      ICON_SET_CONFIGURATION_TAG,
      JSON.stringify(configForStorage, null, 2),
    );
  }
}

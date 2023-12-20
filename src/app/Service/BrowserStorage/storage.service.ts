import { Injectable } from '@angular/core';
import { DOMAIN_CONFIGURATION_TAG } from '../../Domain/Common/constants';
import {
  DomainConfiguration,
  fromConfigurationFromFile,
} from '../../Domain/Common/domainConfiguration';

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
}

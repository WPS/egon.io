import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { ElementTypes } from 'src/app/domain/entities/elementTypes';
import {
  ICON_SET_CONFIGURATION_KEY,
  INITIAL_ICON_SET_NAME,
} from '../../../domain/entities/constants';
import { IconSet } from '../../../domain/entities/iconSet';
import { IconSetConfigurationForExport } from '../../../domain/entities/icon-set-configuration-for-export';
import { CustomIconSetConfiguration } from '../../../domain/entities/custom-icon-set-configuration';
import { StorageService } from '../../../domain/services/storage.service';
import { sanitizeIconName } from '../../../utils/sanitizer';

export interface FileConfiguration {
  name: string;
  actors: { [p: string]: any };
  workObjects: { [p: string]: any };
}

@Injectable({
  providedIn: 'root',
})
export class IconSetImportExportService {
  private iconSetNameSubject = new BehaviorSubject<string>(
    INITIAL_ICON_SET_NAME,
  );

  iconSetName$ = this.iconSetNameSubject.asObservable();

  constructor(
    private iconDictionaryService: IconDictionaryService,
    private elementRegistryService: ElementRegistryService,
    private storageService: StorageService,
  ) {}

  setIconSetName(name: string): void {
    this.iconSetNameSubject.next(name);
  }

  exportConfiguration(): void {
    const iconSetConfiguration = this.getCurrentConfigurationForExport();
    if (!iconSetConfiguration) {
      return;
    }

    const configJSONString = JSON.stringify(iconSetConfiguration, null, 2);
    const filename = this.iconSetNameSubject.value;
    const element = document.createElement('a');

    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(configJSONString),
    );
    element.setAttribute('download', filename + '.iconset');
    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  loadConfiguration(customConfig: IconSet, updateIconSetName = true): void {
    let actorDict = new Dictionary();
    let workObjectDict = new Dictionary();

    if (customConfig.actors.keysArray()) {
      actorDict = customConfig.actors;
      workObjectDict = customConfig.workObjects;
    } else {
      actorDict.addEach(customConfig.actors);
      workObjectDict.addEach(customConfig.workObjects);
    }

    const actorKeys = actorDict.keysArray();
    const workObjectKeys = workObjectDict.keysArray();

    this.iconDictionaryService.updateIconRegistries([], [], customConfig);

    this.iconDictionaryService.addIconsFromIconSetConfiguration(
      ElementTypes.ACTOR,
      actorKeys.map((a) => ElementTypes.ACTOR + a),
    );
    this.iconDictionaryService.addIconsFromIconSetConfiguration(
      ElementTypes.WORKOBJECT,
      workObjectKeys.map((w) => ElementTypes.WORKOBJECT + w),
    );

    if (updateIconSetName) {
      const configurationName = customConfig.name;
      this.setIconSetName(configurationName);
    }
  }

  private getCurrentConfiguration(): IconSet | undefined {
    const actors = this.iconDictionaryService.getActorsDictionary();
    const workObjects = this.iconDictionaryService.getWorkObjectsDictionary();

    let iconSetConfiguration;

    if (actors.size() > 0 && workObjects.size() > 0) {
      iconSetConfiguration = this.createConfigFromDictionaries(
        actors,
        workObjects,
      );
    }
    return iconSetConfiguration;
  }

  getCurrentConfigurationForExport():
    | IconSetConfigurationForExport
    | undefined {
    const currentConfiguration = this.getCurrentConfiguration();

    if (currentConfiguration) {
      const actors: any = {};
      const workObjects: any = {};

      currentConfiguration.actors.all().forEach((entry) => {
        actors[entry.key] = entry.value;
      });
      currentConfiguration.workObjects.all().forEach((entry) => {
        workObjects[entry.key] = entry.value;
      });

      return {
        name: currentConfiguration.name,
        actors: actors,
        workObjects: workObjects,
      };
    }
    return;
  }

  getCurrentConfigurationNamesWithoutPrefix(): CustomIconSetConfiguration {
    return {
      name: this.iconSetNameSubject.value || INITIAL_ICON_SET_NAME,
      actors: this.iconDictionaryService
        .getActorsDictionary()
        .keysArray()
        .map((a) => a.replace(ElementTypes.ACTOR, '')),
      workObjects: this.iconDictionaryService
        .getWorkObjectsDictionary()
        .keysArray()
        .map((w) => w.replace(ElementTypes.WORKOBJECT, '')),
    };
  }

  private createConfigFromDictionaries(
    actorsDict: Dictionary,
    workObjectsDict: Dictionary,
  ): IconSet {
    const actorNames = actorsDict.keysArray();
    const workobjectNames = workObjectsDict.keysArray();
    const newActors = new Dictionary();
    const newWorkobjects = new Dictionary();

    // Fill Configuration from Canvas-Objects
    actorNames.forEach((actor) => {
      newActors.add(
        actorsDict.get(actor),
        actor.replace(ElementTypes.ACTOR, ''),
      );
    });
    workobjectNames.forEach((workObject) => {
      newWorkobjects.add(
        workObjectsDict.get(workObject),
        workObject.replace(ElementTypes.WORKOBJECT, ''),
      );
    });

    return {
      name: this.iconSetNameSubject.value,
      actors: newActors,
      workObjects: newWorkobjects,
    };
  }

  public createIconSetConfiguration(
    fileConfiguration: FileConfiguration,
  ): IconSet {
    if (fileConfiguration === undefined) {
      return {
        name: '',
        actors: new Dictionary(),
        workObjects: new Dictionary(),
      };
    }

    const actorsDict = new Dictionary();
    const workObjectsDict = new Dictionary();
    Object.keys(fileConfiguration.actors).forEach((key) => {
      let icon = fileConfiguration.actors[key];
      if (icon) {
        // make sure the actor has an icon
        actorsDict.add(icon, sanitizeIconName(key));
      }
    });

    Object.keys(fileConfiguration.workObjects).forEach((key) => {
      let icon = fileConfiguration.workObjects[key];
      if (icon) {
        // make sure the work object has an icon
        workObjectsDict.add(icon, sanitizeIconName(key));
      }
    });

    return {
      name: fileConfiguration.name,
      actors: actorsDict,
      workObjects: workObjectsDict,
    };
  }

  public getStoredIconSetConfiguration(): IconSet | undefined {
    const iconSetString = this.storageService.get(ICON_SET_CONFIGURATION_KEY);

    if (!iconSetString) {
      return;
    } else {
      const configurationFromFile = this.createIconSetConfiguration(
        JSON.parse(iconSetString),
      );
      if (this.checkValidityOfConfiguration(configurationFromFile)) {
        return configurationFromFile;
      }
    }
    return;
  }

  public setStoredIconSetConfiguration(config: IconSet): void {
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

    this.storageService.set(
      ICON_SET_CONFIGURATION_KEY,
      JSON.stringify(configForStorage, null, 2),
    );
  }

  private checkValidityOfConfiguration(iconSetConfiguration: IconSet) {
    return (
      iconSetConfiguration.actors.keysArray().length > 1 &&
      iconSetConfiguration.workObjects.keysArray().length > 1 &&
      !iconSetConfiguration.actors
        .all()
        .some((e) => typeof e.value !== 'string') &&
      !iconSetConfiguration.workObjects
        .all()
        .some((e) => typeof e.value !== 'string')
    );
  }
}

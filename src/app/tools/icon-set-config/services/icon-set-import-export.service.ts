import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { ElementTypes } from 'src/app/domain/entities/elementTypes';
import {
  ICON_SET_CONFIGURATION_KEY,
  INITIAL_ICON_SET_NAME,
} from '../../../domain/entities/constants';
import { IconSet } from '../../../domain/entities/iconSet';
import { IconSetConfigurationForExport } from '../../../domain/entities/icon-set-configuration-for-export';
import { StorageService } from '../../../domain/services/storage.service';
import { downloadFile } from 'src/app/utils/downloadFile';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';

export interface FileConfiguration {
  name: string;
  actors: { [p: string]: any };
  workObjects: { [p: string]: any };
}

@Injectable({
  providedIn: 'root',
})
export class IconSetImportExportService {
  private readonly iconDictionaryService = inject(IconDictionaryService);
  private readonly storageService = inject(StorageService);

  private readonly iconSetNameSubject = new BehaviorSubject<string>(
    INITIAL_ICON_SET_NAME,
  );
  readonly iconSetChangedSubject: Subject<void> = new Subject<void>();

  readonly iconSetName$ = this.iconSetNameSubject.asObservable();

  setIconSetName(name: string): void {
    this.iconSetNameSubject.next(name);
  }

  getIconSetName(): string {
    return this.iconSetNameSubject.getValue();
  }

  exportConfiguration(): void {
    const iconSetConfiguration = this.getCurrentConfigurationForExport();
    if (!iconSetConfiguration) {
      return;
    }

    const configJSONString = JSON.stringify(iconSetConfiguration, null, 2);
    const filename = this.iconSetNameSubject.value;

    downloadFile(
      configJSONString,
      'data:text/plain;charset=utf-8,',
      filename,
      '.iconset',
    );
  }

  loadIconSet(iconSet: IconSet, updateIconSetName = true): void {
    this.iconDictionaryService.updateIconRegistries(iconSet);

    if (updateIconSetName) {
      this.setIconSetName(iconSet.name);
    }
  }

  private getCurrentConfiguration(): IconSet | undefined {
    const actors = this.iconDictionaryService.getIconsAssignedAs(
      ElementTypes.ACTOR,
    );
    const workObjects = this.iconDictionaryService.getIconsAssignedAs(
      ElementTypes.WORKOBJECT,
    );

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

  private createConfigFromDictionaries(
    actorsDict: Dictionary,
    workObjectsDict: Dictionary,
  ): IconSet {
    const actorNames = actorsDict.keysArray();
    const workObjectNames = workObjectsDict.keysArray();
    const newActors = new Dictionary();
    const newWorkObjects = new Dictionary();

    // Fill Configuration from Canvas-Objects
    actorNames.forEach((actor) => {
      newActors.set(
        actor.replace(ElementTypes.ACTOR, ''),
        actorsDict.get(actor),
      );
    });
    workObjectNames.forEach((workObject) => {
      newWorkObjects.set(
        workObject.replace(ElementTypes.WORKOBJECT, ''),
        workObjectsDict.get(workObject),
      );
    });

    return {
      name: this.iconSetNameSubject.value,
      actors: newActors,
      workObjects: newWorkObjects,
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

    return {
      name: fileConfiguration.name,
      actors: Dictionary.fromRecord(fileConfiguration.actors),
      workObjects: Dictionary.fromRecord(fileConfiguration.workObjects),
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
    const configForStorage = {
      name: config.name,
      actors: config.actors.toRecord(),
      workObjects: config.workObjects.toRecord(),
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

  saveTrigger() {
    this.iconSetChangedSubject.next();
  }
}

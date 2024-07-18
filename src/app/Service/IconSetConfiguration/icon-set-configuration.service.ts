import { Injectable } from '@angular/core';
import { ElementRegistryService } from 'src/app/Service/ElementRegistry/element-registry.service';
import { IconDictionaryService } from 'src/app/Service/IconSetConfiguration/icon-dictionary.service';
import { Dictionary } from 'src/app/Domain/Common/dictionary/dictionary';
import { ElementTypes } from 'src/app/Domain/Common/elementTypes';
import {
  CustomIconSetConfiguration,
  IconSetConfiguration,
  IconSetConfigurationForExport,
} from 'src/app/Domain/Icon-Set-Configuration/iconSetConfiguration';
import { defaultConf } from '../../Domain/Icon-Set-Configuration/iconConfiguration';
import { TitleService } from '../Title/title.service';
import { INITIAL_ICON_SET_NAME } from '../../Domain/Common/constants';

@Injectable({
  providedIn: 'root',
})
export class IconSetConfigurationService {
  constructor(
    private iconDictionaryService: IconDictionaryService,
    private elementRegistryService: ElementRegistryService,
    private titleService: TitleService,
  ) {}

  setIconSetName(iconSetName: string): void {
    this.titleService.setIconSetName(
      iconSetName ? iconSetName : INITIAL_ICON_SET_NAME,
    );
  }

  exportConfiguration(): void {
    const iconSetConfiguration = this.getCurrentConfigurationForExport();
    if (!iconSetConfiguration) {
      return;
    }

    const configJSONString = JSON.stringify(iconSetConfiguration, null, 2);
    const filename = this.titleService.getIconSetName();
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

  loadConfiguration(
    customConfig: IconSetConfiguration,
    updateIconSetName = true,
  ): void {
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

    this.iconDictionaryService
      .getIconConfiguration()
      .appendSRCFile(actorKeys, actorDict, workObjectKeys, workObjectDict);

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

  getCurrentConfiguration(): IconSetConfiguration | undefined {
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
      name: this.titleService.getIconSetName() || INITIAL_ICON_SET_NAME,
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

  createMinimalConfigurationWithDefaultIcons(): IconSetConfiguration {
    const minimalConfig = this.createConfigFromCanvas();

    defaultConf.actors.forEach((iconName) => {
      minimalConfig.actors.add(
        this.iconDictionaryService.getIconSource(iconName),
        iconName,
      );
    });
    defaultConf.workObjects.forEach((iconName) => {
      minimalConfig.workObjects.add(
        this.iconDictionaryService.getIconSource(iconName),
        iconName,
      );
    });

    return minimalConfig;
  }

  private createConfigFromDictionaries(
    actorsDict: Dictionary,
    workObjectsDict: Dictionary,
  ): IconSetConfiguration {
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
      name: this.titleService.getIconSetName(),
      actors: newActors,
      workObjects: newWorkobjects,
    };
  }

  private createConfigFromCanvas(): IconSetConfiguration {
    const config = {
      name: INITIAL_ICON_SET_NAME,
      actors: new Dictionary(),
      workObjects: new Dictionary(),
    };

    let allCanvasObjects = this.elementRegistryService.getAllCanvasObjects();

    allCanvasObjects
      .map((e) => e.businessObject)
      .forEach((element) => {
        const type = element.type
          .replace(ElementTypes.ACTOR, '')
          .replace(ElementTypes.WORKOBJECT, '');
        if (element.type.includes(ElementTypes.ACTOR)) {
          let src = this.iconDictionaryService.getIconSource(type) || '';
          config.actors.add(src, type);
        } else if (element.type.includes(ElementTypes.WORKOBJECT)) {
          let src = this.iconDictionaryService.getIconSource(type) || '';
          config.workObjects.add(src, type);
        }
      });

    return config;
  }
}

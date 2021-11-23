import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DomainConfiguration } from 'src/app/common/domain/domainConfiguration';
import { DomainConfigurationService } from 'src/app/domain-configuration/service/domain-configuration.service';
import { IconDictionaryService } from 'src/app/domain-configuration/service/icon-dictionary.service';
import { BehaviorSubject } from 'rxjs';
import { Dictionary } from 'src/app/common/domain/dictionary/dictionary';
import { elementTypes } from 'src/app/common/domain/elementTypes';
import { getNameFromType } from 'src/app/common/util/naming';
import { sanitizeIconName } from 'src/app/common/util/sanitizer';
import { ModelerService } from 'src/app/modeler/service/modeler.service';
import { IconListItem } from '../domain/iconListItem';
import { IconFilterEnum } from '../domain/iconFilterEnum';

@Component({
  selector: 'app-domain-configuration',
  templateUrl: './domain-configuration.component.html',
  styleUrls: ['./domain-configuration.component.scss'],
})
export class DomainConfigurationComponent implements OnInit {
  private domainConfigurationTypes: DomainConfiguration | undefined;
  private readonly initialConfigurationNames: DomainConfiguration | undefined;

  private configurationHasChanged = false;

  public filter = new BehaviorSubject<IconFilterEnum>(
    IconFilterEnum.ICON_FILTER_NONE
  );

  selectedActors = new BehaviorSubject<string[]>([]);
  selectedWorkobjects = new BehaviorSubject<string[]>([]);
  name = new BehaviorSubject<string>('');

  allIcons: Dictionary;
  allIconNames = new BehaviorSubject<string[]>([]);
  allFilteredIconNames = new BehaviorSubject<string[]>([]);

  constructor(
    private modelerService: ModelerService,
    private configurationService: DomainConfigurationService,
    private iconDictionaryService: IconDictionaryService
  ) {
    this.domainConfigurationTypes =
      configurationService.getCurrentConfigurationNamesWithoutPrefix();
    this.initialConfigurationNames =
      configurationService.getCurrentConfigurationNamesWithoutPrefix();

    this.allIcons = this.iconDictionaryService.getFullDictionary();
    this.allIconNames.next(this.allIcons.keysArray());
    this.name.next(this.domainConfigurationTypes?.name || '');

    // @ts-ignore
    this.selectedWorkobjects.next(this.domainConfigurationTypes?.workObjects);
    // @ts-ignore
    this.selectedActors.next(this.domainConfigurationTypes?.actors);
  }

  ngOnInit(): void {
    this.filter.subscribe((type) => {
      let allFiltered = this.getFilteredNamesForType(type);
      this.allFilteredIconNames.next(allFiltered);
    });
  }

  private getFilteredNamesForType(type: IconFilterEnum): string[] {
    let allFiltered: string[] = [];
    switch (type) {
      case IconFilterEnum.ICON_FILTER_NONE:
        allFiltered = this.allIconNames.value;
        break;
      case IconFilterEnum.ICON_FILTER_ACTOR:
        allFiltered = this.allIconNames.value.filter((name) =>
          this.checkForActor(name)
        );
        break;
      case IconFilterEnum.ICON_FILTER_WORKOBJECT:
        allFiltered = this.allIconNames.value.filter((name) =>
          this.checkForWorkObject(name)
        );
        break;
      case IconFilterEnum.ICON_FILTER_UNASSIGNED:
        allFiltered = this.allIconNames.value.filter(
          (name) => !this.checkForActor(name) && !this.checkForWorkObject(name)
        );
        break;
    }
    return allFiltered;
  }

  checkForActor(iconName: string): boolean {
    return (
      this.domainConfigurationTypes?.actors.filter((actor: string) =>
        actor.includes(iconName)
      ).length > 0
    );
  }

  checkForWorkObject(iconName: string): boolean {
    return (
      this.domainConfigurationTypes?.workObjects.filter((workObject: string) =>
        workObject.includes(iconName)
      ).length > 0
    );
  }

  // @ts-ignore
  checkActor(event, actor: string): void {
    if (event) {
      this.selectActor(actor);
      this.deselectWorkobject(actor);
    } else {
      this.deselectActor(actor);
    }
  }

  // @ts-ignore
  checkWorkobject(event, workobject: string): void {
    if (event) {
      this.selectWorkObject(workobject);
      this.deselectActor(workobject);
    } else {
      this.deselectWorkobject(workobject);
    }
  }

  changeName(name: string): void {
    if (this.domainConfigurationTypes) {
      this.domainConfigurationTypes.name = name;
    }
  }

  private updateActorSubject(): void {
    // @ts-ignore
    this.selectedActors.next(this.domainConfigurationTypes?.actors);
    this.configurationHasChanged = true;
  }

  private updateWorkObjectSubject(): void {
    // @ts-ignore
    this.selectedWorkobjects.next(this.domainConfigurationTypes?.workObjects);
    this.configurationHasChanged = true;
  }

  selectActor(actor: string): void {
    // @ts-ignore
    this.domainConfigurationTypes?.actors.push(actor);
    this.updateActorSubject();
  }

  selectWorkObject(workObject: string): void {
    // @ts-ignore
    this.domainConfigurationTypes?.workObjects.push(workObject);
    this.updateWorkObjectSubject();
  }

  deselectActor(actor: string): void {
    if (this.domainConfigurationTypes) {
      this.domainConfigurationTypes = {
        name: this.domainConfigurationTypes.name,
        actors: this.domainConfigurationTypes.actors.filter(
          (a: string) => !a.includes(actor)
        ),
        workObjects: this.domainConfigurationTypes.workObjects,
      };
    }
    this.updateActorSubject();
  }

  deselectWorkobject(workobject: string): void {
    if (this.domainConfigurationTypes) {
      this.domainConfigurationTypes = {
        name: this.domainConfigurationTypes.name,
        actors: this.domainConfigurationTypes.actors,
        workObjects: this.domainConfigurationTypes.workObjects.filter(
          (w: string) => !w.includes(workobject)
        ),
      };
    }
    this.updateWorkObjectSubject();
  }

  resetDomain(): void {
    this.modelerService.restart(
      this.configurationService.createDefaultConfig()
    );
  }

  saveDomain(): void {
    if (this.configurationHasChanged) {
      const domainConfiguration = this.createDomainConfiguration();
      console.log(domainConfiguration);
      this.modelerService.restart(domainConfiguration);
    }
  }

  private createDomainConfiguration(): DomainConfiguration {
    const actors: { [key: string]: any } = {};
    const workObjects: { [key: string]: any } = {};

    this.domainConfigurationTypes?.actors.forEach((type: string) => {
      actors[type] = this.iconDictionaryService.getIconSource(
        getNameFromType(type)
      );
    });
    this.domainConfigurationTypes?.workObjects.forEach((type: string) => {
      workObjects[type] = this.iconDictionaryService.getIconSource(
        getNameFromType(type)
      );
    });

    return {
      name: this.domainConfigurationTypes?.name || '',
      actors,
      workObjects,
    };
  }

  exportDomain(): void {
    this.saveDomain();
    this.configurationService.exportConfiguration();
  }

  cancel(): void {
    this.domainConfigurationTypes = this.initialConfigurationNames;
    this.resetToInitialConfiguration();
  }

  startIconUpload(): void {
    // @ts-ignore
    document.getElementById('importIcon').click();
  }

  startDomainImport(): void {
    // @ts-ignore
    document.getElementById('importDomain').click();
  }

  importDomain(): void {
    // @ts-ignore
    const domainInputFile = document.getElementById('importDomain').files[0];
    const reader = new FileReader();

    reader.onloadend = (e) => {
      // @ts-ignore
      this.configurationService.importConfiguration(e.target.result);
    };

    reader.readAsDataURL(domainInputFile);
  }

  importIcon(): void {
    // @ts-ignore
    const iconInputFile = document.getElementById('importIcon').files[0];
    const reader = new FileReader();
    const endIndex = iconInputFile.name.lastIndexOf('.');
    const iconName = sanitizeIconName(
      iconInputFile.name.substring(0, endIndex)
    );

    reader.onloadend = (e) => {
      this.iconDictionaryService.addIMGToIconDictionary(
        // @ts-ignore
        e.target.result,
        iconName + '_custom'
      );

      this.allIcons = this.iconDictionaryService.getFullDictionary();
      this.allIconNames.next(this.allIcons.keysArray());
    };

    reader.readAsDataURL(iconInputFile);
  }

  getSrcForIcon(name: string): string {
    let iconName = '';
    if (name.includes(elementTypes.DOMAINSTORY)) {
      iconName = getNameFromType(name);
    } else {
      iconName = name;
    }
    const rawSrc = this.iconDictionaryService.getIconSource(iconName);

    if (!rawSrc) {
      return '';
    }

    if (rawSrc.startsWith('data')) {
      return rawSrc;
    } else {
      return 'data:image/svg+xml,' + rawSrc;
    }
  }

  private resetToInitialConfiguration(): void {
    this.updateActorSubject();
    this.updateWorkObjectSubject();
  }

  getIconForName(iconName: string): IconListItem {
    return {
      name: iconName,
      svg: this.getSrcForIcon(iconName),
      isActor: this.checkForActor(iconName),
      isWorkObject: this.checkForWorkObject(iconName),
    };
  }

  filterForActors(): void {
    if (this.filter.value !== IconFilterEnum.ICON_FILTER_ACTOR) {
      this.filter.next(IconFilterEnum.ICON_FILTER_ACTOR);
    } else {
      this.filter.next(IconFilterEnum.ICON_FILTER_NONE);
    }
  }

  filterForWorkobjects(): void {
    if (this.filter.value !== IconFilterEnum.ICON_FILTER_WORKOBJECT) {
      this.filter.next(IconFilterEnum.ICON_FILTER_WORKOBJECT);
    } else {
      this.filter.next(IconFilterEnum.ICON_FILTER_NONE);
    }
  }

  filterForUnassigned(): void {
    if (this.filter.value !== IconFilterEnum.ICON_FILTER_UNASSIGNED) {
      this.filter.next(IconFilterEnum.ICON_FILTER_UNASSIGNED);
    } else {
      this.filter.next(IconFilterEnum.ICON_FILTER_NONE);
    }
  }

  filterByNameAndType($event: any) {
    const filteredByNameAndType = this.getFilteredNamesForType(
      this.filter.value
    ).filter((name) =>
      name.toLowerCase().includes($event.target.value.toLowerCase())
    );
    this.allFilteredIconNames.next(filteredByNameAndType);
  }
}

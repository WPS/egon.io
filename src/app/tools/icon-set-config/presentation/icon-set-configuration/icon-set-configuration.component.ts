import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { IconSetConfigurationService } from 'src/app/tools/icon-set-config/services/icon-set-configuration.service';
import {
  ICON_PREFIX,
  IconDictionaryService,
} from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { sanitizeIconName } from 'src/app/utils/sanitizer';
import { ElementTypes } from '../../../../domain/entities/elementTypes';
import { IconFilterEnum } from '../../domain/iconFilterEnum';
import { IconSetCustomizationService } from '../../services/icon-set-customization.service';
import { CustomIconSetConfiguration } from '../../../../domain/entities/custom-icon-set-configuration';

@Component({
  selector: 'app-icon-set-configuration',
  templateUrl: './icon-set-configuration.component.html',
  styleUrls: ['./icon-set-configuration.component.scss'],
})
export class IconSetConfigurationComponent implements OnInit {
  private iconSetConfigurationTypes: CustomIconSetConfiguration;

  filter = new BehaviorSubject<IconFilterEnum>(IconFilterEnum.ICON_FILTER_NONE);

  selectedActors = new BehaviorSubject<string[]>([]);
  selectedWorkobjects = new BehaviorSubject<string[]>([]);

  allIcons: BehaviorSubject<Dictionary>;
  allIconNames = new BehaviorSubject<string[]>([]);
  allFilteredIconNames = new BehaviorSubject<string[]>([]);

  constructor(
    private iconSetConfigurationService: IconSetConfigurationService,
    private iconDictionaryService: IconDictionaryService,
    private iconSetCustomizationService: IconSetCustomizationService,
    private elementRegistryService: ElementRegistryService,
  ) {
    this.iconSetConfigurationTypes =
      this.iconSetCustomizationService.getIconSetConfiguration().value;

    this.allIcons = new BehaviorSubject(
      this.iconDictionaryService.getFullDictionary(),
    );
    this.allIcons.subscribe((allIcons) => {
      this.allIconNames.next(allIcons.keysArray().sort(this.sortByName));
    });

    this.selectedActors = this.iconSetCustomizationService.selectedActors$;
    this.selectedWorkobjects =
      this.iconSetCustomizationService.selectedWorkobjects$;
  }

  ngOnInit(): void {
    this.filter.subscribe((type) => {
      let allFiltered = this.getFilteredNamesForType(type);
      this.allFilteredIconNames.next(allFiltered.sort(this.sortByName));
    });
  }

  private sortByName(a: string, b: string): number {
    if (a.includes('_custom') == b.includes('_custom')) {
      if (a < b) return -1;
      else {
        return 1;
      }
    } else {
      if (a.includes('_custom')) {
        return -1;
      } else {
        return 1;
      }
    }
  }

  /** Default Icon Set **/
  loadMinimalIconConfigurationWithDefaultIcons(): void {
    this.iconSetCustomizationService.resetIconSet();
  }

  loadInitialConfiguration(): void {
    this.iconSetCustomizationService.cancel();
  }

  /** Persist Icon Set **/
  saveIconSet(): void {
    this.iconSetCustomizationService.saveIconSet(
      this.elementRegistryService.getUsedIcons(),
    );
  }

  exportIconSet(): void {
    this.iconSetCustomizationService.exportIconSet();
  }

  /** Add Custom Icon **/
  startIconUpload(): void {
    document.getElementById('importIcon')?.click();
  }

  importIcon(): void {
    // @ts-ignore
    const files = document.getElementById('importIcon').files;
    for (let iconInputFile of files) {
      const reader = new FileReader();
      const name = sanitizeIconName(iconInputFile.name);
      const iconName = name + ElementTypes.CUSTOM;

      reader.onloadend = (e: ProgressEvent<FileReader>) => {
        if (e.target) {
          const src: string = e.target.result as unknown as string;
          this.iconDictionaryService.addIMGToIconDictionary(src, iconName);
          // TODO: td: What kind of type is it here?
          this.iconDictionaryService.registerIconForBPMN(
            iconName,
            ICON_PREFIX + iconName.toLowerCase(),
            ElementTypes.ACTOR,
          );

          this.allIcons.next(this.iconDictionaryService.getFullDictionary());
          this.filter.next(this.filter.value);

          this.iconSetCustomizationService.addNewIcon(iconName);
        }
      };
      reader.readAsDataURL(iconInputFile);
    }
  }

  /** Import Icon Set **/
  startIconSetImport(): void {
    document.getElementById('importDomain')?.click();
  }

  importIconSet(): void {
    // @ts-ignore
    const iconSetInputFile = document.getElementById('importDomain').files[0];
    const reader = new FileReader();

    reader.onloadend = (e: ProgressEvent<FileReader>) => {
      const configFromFile = JSON.parse(
        e.target?.result as unknown as string,
      ) as {
        name: string;
        actors: { [key: string]: any };
        workObjects: { [key: string]: any };
      };
      const config =
        this.iconSetConfigurationService.createIconSetConfiguration(
          configFromFile,
        );
      this.iconSetConfigurationService.loadConfiguration(config, false);

      this.iconSetCustomizationService.importConfiguration(config);
    };

    reader.readAsText(iconSetInputFile);
  }

  /** Filter **/
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
      this.filter.value,
    ).filter((name) =>
      name.toLowerCase().includes($event.target.value.toLowerCase()),
    );
    this.allFilteredIconNames.next(filteredByNameAndType.sort(this.sortByName));
  }

  private getFilteredNamesForType(type: IconFilterEnum): string[] {
    let allFiltered: string[] = [];
    switch (type) {
      case IconFilterEnum.ICON_FILTER_NONE:
        allFiltered = this.allIconNames.value;
        break;
      case IconFilterEnum.ICON_FILTER_ACTOR:
        allFiltered = this.allIconNames.value.filter((name) =>
          this.iconSetCustomizationService.isIconActor(name),
        );
        break;
      case IconFilterEnum.ICON_FILTER_WORKOBJECT:
        allFiltered = this.allIconNames.value.filter((name) =>
          this.iconSetCustomizationService.isIconWorkObject(name),
        );
        break;
      case IconFilterEnum.ICON_FILTER_UNASSIGNED:
        allFiltered = this.allIconNames.value.filter(
          (name) =>
            !this.iconSetCustomizationService.isIconActor(name) &&
            !this.iconSetCustomizationService.isIconWorkObject(name),
        );
        break;
    }
    return allFiltered;
  }
}

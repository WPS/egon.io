import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { IconSetImportExportService } from 'src/app/tools/icon-set-config/services/icon-set-import-export.service';
import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { sanitizeIconName } from 'src/app/utils/sanitizer';
import { IconFilterOptions } from '../../domain/iconFilterOptions';
import { IconSetCustomizationService } from '../../services/icon-set-customization.service';
import { CustomIconSetConfiguration } from '../../../../domain/entities/custom-icon-set-configuration';

@Component({
  selector: 'app-icon-set-configuration',
  templateUrl: './icon-set-configuration.component.html',
  styleUrls: ['./icon-set-configuration.component.scss'],
  standalone: false,
})
export class IconSetConfigurationComponent implements OnInit {
  private iconSetConfigurationTypes: CustomIconSetConfiguration;

  filter = new BehaviorSubject<IconFilterOptions>(IconFilterOptions.NO_FILTER);

  selectedActors = new BehaviorSubject<string[]>([]);
  selectedWorkobjects = new BehaviorSubject<string[]>([]);

  allIcons: BehaviorSubject<Dictionary>;
  allIconNames = new BehaviorSubject<string[]>([]);
  allFilteredIconNames = new BehaviorSubject<string[]>([]);

  constructor(
    private iconSetImportExportService: IconSetImportExportService,
    private iconDictionaryService: IconDictionaryService,
    private iconSetCustomizationService: IconSetCustomizationService,
    private elementRegistryService: ElementRegistryService,
  ) {
    this.iconSetConfigurationTypes =
      this.iconSetCustomizationService.getIconSetConfiguration().value;

    this.allIcons = new BehaviorSubject<Dictionary>(
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
    return a.toLowerCase().localeCompare(b.toLowerCase());
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
      const iconName = name + '-custom'; // this suffix helps users to see which icons they uploaded; it should not be used to check if an icon is actually custom or not since this convention was introduce after v1.3.0 and is therefore not reliable information

      reader.onloadend = (e: ProgressEvent<FileReader>) => {
        if (e.target) {
          const src: string = e.target.result as unknown as string;
          this.iconDictionaryService.addIMGToIconDictionary(src, iconName);
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
        this.iconSetImportExportService.createIconSetConfiguration(
          configFromFile,
        );
      this.iconSetImportExportService.loadConfiguration(config, false);

      this.iconSetCustomizationService.importConfiguration(config);

      this.allIcons.next(this.iconDictionaryService.getFullDictionary());
      this.filter.next(this.filter.value);
    };

    reader.readAsText(iconSetInputFile);
  }

  /** Filter **/
  filterForActors(): void {
    if (this.filter.value !== IconFilterOptions.ONLY_ACTORS) {
      this.filter.next(IconFilterOptions.ONLY_ACTORS);
    } else {
      this.filter.next(IconFilterOptions.NO_FILTER);
    }
  }

  filterForWorkobjects(): void {
    if (this.filter.value !== IconFilterOptions.ONLY_WORKOBJECTS) {
      this.filter.next(IconFilterOptions.ONLY_WORKOBJECTS);
    } else {
      this.filter.next(IconFilterOptions.NO_FILTER);
    }
  }

  filterForUnassigned(): void {
    if (this.filter.value !== IconFilterOptions.ONLY_UNASSIGNED) {
      this.filter.next(IconFilterOptions.ONLY_UNASSIGNED);
    } else {
      this.filter.next(IconFilterOptions.NO_FILTER);
    }
  }

  filterByNameAndType($event: any) {
    const filteredByKeyWord = this.allIcons.value
      .all()
      .filter((entry) =>
        entry.keyWords.some((key) => {
          return key.toLowerCase().includes($event.target.value.toLowerCase());
        }),
      )
      .map((entry) => entry.key);

    const filteredByNameAndType = this.getFilteredNamesForType(
      this.filter.value,
    ).filter(
      (name) =>
        name.toLowerCase().includes($event.target.value.toLowerCase()) ||
        filteredByKeyWord.includes(name),
    );
    this.allFilteredIconNames.next(filteredByNameAndType.sort(this.sortByName));
  }

  private getFilteredNamesForType(type: IconFilterOptions): string[] {
    let allFiltered: string[] = [];
    switch (type) {
      case IconFilterOptions.NO_FILTER:
        allFiltered = this.allIconNames.value;
        break;
      case IconFilterOptions.ONLY_ACTORS:
        allFiltered = this.allIconNames.value.filter((name) =>
          this.iconSetCustomizationService.isIconActor(name),
        );
        break;
      case IconFilterOptions.ONLY_WORKOBJECTS:
        allFiltered = this.allIconNames.value.filter((name) =>
          this.iconSetCustomizationService.isIconWorkObject(name),
        );
        break;
      case IconFilterOptions.ONLY_UNASSIGNED:
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

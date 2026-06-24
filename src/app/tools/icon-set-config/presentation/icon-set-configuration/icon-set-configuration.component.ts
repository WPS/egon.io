import {
  Component,
  effect,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { IconSetImportExportService } from 'src/app/tools/icon-set-config/services/icon-set-import-export.service';
import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { sanitizeIconName } from 'src/app/utils/sanitizer';
import { IconFilterOptions } from '../../domain/iconFilterOptions';
import { IconSetCustomizationService } from '../../services/icon-set-customization.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SelectableIconComponent } from '../selectable-icon/selectable-icon.component';
import { IconSetComponent } from '../icon-set/icon-set.component';

@Component({
  selector: 'app-icon-set-configuration',
  templateUrl: './icon-set-configuration.component.html',
  styleUrls: ['./icon-set-configuration.component.scss'],

  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    SelectableIconComponent,
    IconSetComponent,
  ],
})
export class IconSetConfigurationComponent {
  private readonly iconSetImportExportService = inject(
    IconSetImportExportService,
  );
  private readonly iconDictionaryService = inject(IconDictionaryService);
  private readonly iconSetCustomizationService = inject(
    IconSetCustomizationService,
  );
  private readonly elementRegistryService = inject(ElementRegistryService);

  readonly filter: WritableSignal<IconFilterOptions> = signal(
    IconFilterOptions.NO_FILTER,
  );

  readonly allIcons: WritableSignal<Dictionary<string>> = signal(
    this.iconDictionaryService.getFullDictionary(),
  );
  readonly allIconNames: WritableSignal<string[]> = signal([]);
  readonly allFilteredIconNames: WritableSignal<string[]> = signal([]);

  constructor() {
    effect(() => {
      this.allIconNames.set(this.allIcons().keysArray().sort(this.sortByName));
    });
    effect(() => {
      const allFiltered = this.getFilteredNamesForType(this.filter());
      this.allFilteredIconNames.set([...allFiltered].sort(this.sortByName));
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

  /** Open dialog for uploading custom icon **/
  startIconUpload(): void {
    document.getElementById('importIcon')?.click();
  }

  /** Read icon from file and store it **/
  async importIcon(): Promise<void> {
    // @ts-ignore
    const files = document.getElementById('importIcon').files;
    for (let iconInputFile of files) {
      const name = sanitizeIconName(iconInputFile.name);
      const iconName = name + '-custom'; // this suffix helps users to see which icons they uploaded; it should not be used to check if an icon is actually custom or not since this convention was introduced after v1.3.0 and is therefore not reliable information

      const src = await this.readFileAsDataURL(iconInputFile);
      this.iconDictionaryService.addCustomIcon(src, iconName);
      this.allIcons.set(this.iconDictionaryService.getFullDictionary());
      this.filter.set(this.filter());
      this.iconSetCustomizationService.addNewCustomIcon(iconName);
    }
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  /** Import Icon Set **/
  startIconSetImport(): void {
    document.getElementById('importIconSet')?.click();
  }

  async importIconSet(): Promise<void> {
    // @ts-ignore
    const iconSetInputFile = document.getElementById('importIconSet').files[0];

    const text = await iconSetInputFile.text();
    const configFromFile = JSON.parse(text) as {
      name: string;
      actors: { [key: string]: string };
      workObjects: { [key: string]: string };
    };
    const config =
      this.iconSetImportExportService.createIconSetConfiguration(
        configFromFile,
      );
    this.iconSetImportExportService.loadIconSet(config, false);

    this.iconSetCustomizationService.importConfiguration(config);

    this.allIcons.set(this.iconDictionaryService.getFullDictionary());
    this.filter.set(this.filter());
  }

  /** Filter **/
  filterForActors(): void {
    if (this.filter() === IconFilterOptions.ONLY_ACTORS) {
      this.filter.set(IconFilterOptions.NO_FILTER);
    } else {
      this.filter.set(IconFilterOptions.ONLY_ACTORS);
    }
  }

  filterForWorkObjects(): void {
    if (this.filter() === IconFilterOptions.ONLY_WORKOBJECTS) {
      this.filter.set(IconFilterOptions.NO_FILTER);
    } else {
      this.filter.set(IconFilterOptions.ONLY_WORKOBJECTS);
    }
  }

  filterForUnassigned(): void {
    if (this.filter() === IconFilterOptions.ONLY_UNASSIGNED) {
      this.filter.set(IconFilterOptions.NO_FILTER);
    } else {
      this.filter.set(IconFilterOptions.ONLY_UNASSIGNED);
    }
  }

  filterByNameAndType($event: Event) {
    const filteredByKeyWord = this.allIcons()
      .all()
      .filter((entry) =>
        entry.keyWords.some((key) => {
          //@ts-ignore
          return key.toLowerCase().includes($event.target!.value.toLowerCase());
        }),
      )
      .map((entry) => entry.key);

    const filteredByNameAndType = this.getFilteredNamesForType(
      this.filter(),
    ).filter(
      (name) =>
        //@ts-ignore
        name.toLowerCase().includes($event.target!.value.toLowerCase()) ||
        filteredByKeyWord.includes(name),
    );
    this.allFilteredIconNames.set(
      [...filteredByNameAndType].sort(this.sortByName),
    );
  }

  private getFilteredNamesForType(type: IconFilterOptions): string[] {
    let allFiltered: string[] = [];
    switch (type) {
      case IconFilterOptions.NO_FILTER:
        allFiltered = this.allIconNames();
        break;
      case IconFilterOptions.ONLY_ACTORS:
        allFiltered = this.allIconNames().filter((name) =>
          this.iconSetCustomizationService.isIconActor(name),
        );
        break;
      case IconFilterOptions.ONLY_WORKOBJECTS:
        allFiltered = this.allIconNames().filter((name) =>
          this.iconSetCustomizationService.isIconWorkObject(name),
        );
        break;
      case IconFilterOptions.ONLY_UNASSIGNED:
        allFiltered = this.allIconNames().filter(
          (name) =>
            !this.iconSetCustomizationService.isIconActor(name) &&
            !this.iconSetCustomizationService.isIconWorkObject(name),
        );
        break;
    }
    return allFiltered;
  }
}

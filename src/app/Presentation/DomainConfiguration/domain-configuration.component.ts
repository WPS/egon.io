import { Component, OnInit } from '@angular/core';
import {
  CustomDomainConfiguration,
  DomainConfiguration,
  fromConfigurationFromFile,
} from 'src/app/Domain/Common/domainConfiguration';
import { DomainConfigurationService } from 'src/app/Service/DomainConfiguration/domain-configuration.service';
import { IconDictionaryService } from 'src/app/Service/DomainConfiguration/icon-dictionary.service';
import { BehaviorSubject } from 'rxjs';
import { Dictionary } from 'src/app/Domain/Common/dictionary/dictionary';
import { sanitizeIconName } from 'src/app/Utils/sanitizer';
import { IconFilterEnum } from '../../Domain/Domain-Configuration/iconFilterEnum';
import { DomainCustomizationService } from '../../Service/DomainConfiguration/domain-customization.service';

@Component({
  selector: 'app-domain-configuration',
  templateUrl: './domain-configuration.component.html',
  styleUrls: ['./domain-configuration.component.scss'],
})
export class DomainConfigurationComponent implements OnInit {
  private domainConfigurationTypes: CustomDomainConfiguration;

  public filter = new BehaviorSubject<IconFilterEnum>(
    IconFilterEnum.ICON_FILTER_NONE
  );

  selectedActors = new BehaviorSubject<string[]>([]);
  selectedWorkobjects = new BehaviorSubject<string[]>([]);

  allIcons: BehaviorSubject<Dictionary>;
  allIconNames = new BehaviorSubject<string[]>([]);
  allFilteredIconNames = new BehaviorSubject<string[]>([]);

  constructor(
    private configurationService: DomainConfigurationService,
    private iconDictionaryService: IconDictionaryService,
    private domainCustomizationService: DomainCustomizationService
  ) {
    this.domainConfigurationTypes =
      this.domainCustomizationService.getDomainConfiguration().value;

    this.allIcons = new BehaviorSubject(
      this.iconDictionaryService.getFullDictionary()
    );
    this.allIcons.subscribe((allIcons) => {
      this.allIconNames.next(allIcons.keysArray().sort(this.sortByName));
    });

    // @ts-ignore
    this.selectedWorkobjects =
      this.domainCustomizationService.getSelectedWorkobjects();
    // @ts-ignore
    this.selectedActors = this.domainCustomizationService.getSelectedActors();
  }

  public ngOnInit(): void {
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

  /** Default Domain **/
  public loadMinimalIconConfigurationWithDefaultIcons(): void {
    this.domainCustomizationService.resetDomain();
  }

  public loadInitialConfiguration(): void {
    this.domainCustomizationService.cancel();
  }

  /** Persist Domain **/
  public saveDomain(): void {
    this.domainCustomizationService.saveDomain();
  }

  public exportDomain(): void {
    this.domainCustomizationService.exportDomain();
  }

  /** Add Custom Icon **/
  public startIconUpload(): void {
    // @ts-ignore
    document.getElementById('importIcon').click();
  }

  public importIcon(): void {
    // @ts-ignore
    const files = document.getElementById('importIcon').files;
    for (let iconInputFile of files) {
      const reader = new FileReader();
      const name = sanitizeIconName(iconInputFile.name);
      const iconName = name + '_custom';

      reader.onloadend = (e) => {
        // @ts-ignore
        const src: string = e.target.result;
        this.iconDictionaryService.addIMGToIconDictionary(src, iconName);
        this.iconDictionaryService.registerIconForBPMN(iconName, src);

        this.allIcons.next(this.iconDictionaryService.getFullDictionary());
        this.filter.next(this.filter.value);

        this.domainCustomizationService.addNewIcon(iconName);
      };
      reader.readAsDataURL(iconInputFile);
    }
  }

  /** Import Domain **/
  public startDomainImport(): void {
    // @ts-ignore
    document.getElementById('importDomain').click();
  }

  public importDomain(): void {
    // @ts-ignore
    const domainInputFile = document.getElementById('importDomain').files[0];
    const reader = new FileReader();

    reader.onloadend = (e) => {
      const configFromFile = JSON.parse(
        // @ts-ignore
        e.target.result.toString()
      ) as {
        name: string;
        actors: { [key: string]: any };
        workObjects: { [key: string]: any };
      };
      const config = fromConfigurationFromFile(configFromFile);
      this.configurationService.loadConfiguration(config, false);

      this.domainCustomizationService.importConfiguration(config);
    };

    reader.readAsText(domainInputFile);
  }

  /** Filter **/
  public filterForActors(): void {
    if (this.filter.value !== IconFilterEnum.ICON_FILTER_ACTOR) {
      this.filter.next(IconFilterEnum.ICON_FILTER_ACTOR);
    } else {
      this.filter.next(IconFilterEnum.ICON_FILTER_NONE);
    }
  }

  public filterForWorkobjects(): void {
    if (this.filter.value !== IconFilterEnum.ICON_FILTER_WORKOBJECT) {
      this.filter.next(IconFilterEnum.ICON_FILTER_WORKOBJECT);
    } else {
      this.filter.next(IconFilterEnum.ICON_FILTER_NONE);
    }
  }

  public filterForUnassigned(): void {
    if (this.filter.value !== IconFilterEnum.ICON_FILTER_UNASSIGNED) {
      this.filter.next(IconFilterEnum.ICON_FILTER_UNASSIGNED);
    } else {
      this.filter.next(IconFilterEnum.ICON_FILTER_NONE);
    }
  }

  public filterByNameAndType($event: any) {
    const filteredByNameAndType = this.getFilteredNamesForType(
      this.filter.value
    ).filter((name) =>
      name.toLowerCase().includes($event.target.value.toLowerCase())
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
          this.domainCustomizationService.isIconActor(name)
        );
        break;
      case IconFilterEnum.ICON_FILTER_WORKOBJECT:
        allFiltered = this.allIconNames.value.filter((name) =>
          this.domainCustomizationService.isIconWorkObject(name)
        );
        break;
      case IconFilterEnum.ICON_FILTER_UNASSIGNED:
        allFiltered = this.allIconNames.value.filter(
          (name) =>
            !this.domainCustomizationService.isIconActor(name) &&
            !this.domainCustomizationService.isIconWorkObject(name)
        );
        break;
    }
    return allFiltered;
  }
}

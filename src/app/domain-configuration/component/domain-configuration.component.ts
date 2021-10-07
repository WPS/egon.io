import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { DomainConfiguration } from 'src/app/common/domain/domainConfiguration';
import { DomainConfigurationService } from 'src/app/domain-configuration/service/domain-configuration.service';
import { IconDictionaryService } from 'src/app/domain-configuration/service/icon-dictionary.service';
import { BehaviorSubject } from 'rxjs';
import { Dictionary } from 'src/app/common/domain/dictionary/dictionary';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { elementTypes } from 'src/app/common/domain/elementTypes';
import { getNameFromType } from 'src/app/common/util/naming';
import { sanitizeIconName } from 'src/app/common/util/sanitizer';
import { ModelerService } from 'src/app/modeler/service/modeler.service';

@Component({
  selector: 'app-domain-configuration',
  templateUrl: './domain-configuration.component.html',
  styleUrls: ['./domain-configuration.component.scss'],
})
export class DomainConfigurationComponent implements OnInit {
  private domainConfigurationTypes: DomainConfiguration | undefined;
  private readonly initialConfigurationNames: DomainConfiguration | undefined;

  private configurationHasChanged = false;

  selectedActors = new BehaviorSubject<string[]>([]);
  selectedWorkobjects = new BehaviorSubject<string[]>([]);
  name = new BehaviorSubject<string>('');

  allIcons: Dictionary;
  allIconNames = new BehaviorSubject<string[]>([]);

  @Output() domainConfigurationEvent = new EventEmitter<DomainConfiguration>();

  constructor(
    private modelerService: ModelerService,
    private configurationService: DomainConfigurationService,
    private iconDictionaryService: IconDictionaryService,
    private domSanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.domainConfigurationTypes =
      configurationService.getCurrentConfigurationNames();
    this.initialConfigurationNames =
      configurationService.getCurrentConfigurationNames();

    this.allIcons = this.iconDictionaryService.getFullDictionary();
    this.allIconNames.next(this.allIcons.keysArray());
    this.name.next(this.domainConfigurationTypes?.name || '');

    // @ts-ignore
    this.selectedWorkobjects.next(this.domainConfigurationTypes?.workObjects);
    // @ts-ignore
    this.selectedActors.next(this.domainConfigurationTypes?.actors);
  }

  ngOnInit(): void {}

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

  private redraw(): void {
    this.changeDetectorRef.detectChanges();
  }

  // @ts-ignore
  checkActor(event, actor: string): void {
    if (event.target.checked) {
      this.selectActor(actor);
      this.deselectWorkobject(actor);
    } else {
      this.deselectActor(actor);
    }
    this.redraw();
  }

  // @ts-ignore
  checkWorkobject(event, workobject: string): void {
    if (event.target.checked) {
      this.selectWorkObject(workobject);
      this.deselectActor(workobject);
    } else {
      this.deselectWorkobject(workobject);
    }
    this.redraw();
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
    this.domainConfigurationTypes?.actors.push(elementTypes.ACTOR + actor);
    this.updateActorSubject();
  }

  selectWorkObject(workObject: string): void {
    // @ts-ignore
    this.domainConfigurationTypes?.workObjects.push(
      elementTypes.WORKOBJECT + workObject
    );
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

  emitDomainConfiguration(): void {
    this.domainConfigurationEvent.emit(this.domainConfigurationTypes);
  }

  resetDomain(): void {
    this.modelerService.restart(
      this.configurationService.createDefaultConfig()
    );
  }

  saveDomain(): void {
    if (this.configurationHasChanged) {
      this.modelerService.restart(this.createDomainConfiguration());
      this.emitDomainConfiguration();
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

  getNameFromType(type: string): string {
    return getNameFromType(type);
  }

  getSrcForIcon(name: string): SafeUrl {
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
      return this.domSanitizer.bypassSecurityTrustUrl(rawSrc);
    } else {
      return this.domSanitizer.bypassSecurityTrustUrl(
        'data:image/svg+xml,' + rawSrc
      );
    }
  }

  private resetToInitialConfiguration(): void {
    this.updateActorSubject();
    this.updateWorkObjectSubject();
  }
}
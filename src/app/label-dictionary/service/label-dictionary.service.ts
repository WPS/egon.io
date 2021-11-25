import { Injectable } from '@angular/core';
import { ElementRegistryService } from 'src/app/elementRegistry-service/element-registry.service';
import { elementTypes } from 'src/app/common/domain/elementTypes';
import { MassNamingService } from 'src/app/label-dictionary/service/mass-naming.service';
import { IconDictionaryService } from '../../domain-configuration/service/icon-dictionary.service';
import { WorkObjectLabelEntry } from '../domain/workObjectLabelEntry';
import { LabelEntry } from '../domain/labelEntry';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class LabelDictionaryService {
  activityLabels: LabelEntry[] = [];
  workObjektLabels: WorkObjectLabelEntry[] = [];

  constructor(
    private massNamingService: MassNamingService,
    private elementRegistryService: ElementRegistryService,
    private iconDictionaryService: IconDictionaryService,
    private domSanitizer: DomSanitizer
  ) {}

  public createLabelDictionaries(): void {
    this.activityLabels = [];
    this.activityLabels = [];
    this.workObjektLabels = [];

    const allObjects = this.elementRegistryService.getAllCanvasObjects();

    allObjects.forEach((element) => {
      const name = element.name;
      if (
        name &&
        name.length > 0 &&
        element.type.includes(elementTypes.ACTIVITY) &&
        !this.activityLabels.map((a) => a.name).includes(name)
      ) {
        this.activityLabels.push({
          name,
          originalName: name,
        });
      } else if (
        name &&
        name.length > 0 &&
        element.type.includes(elementTypes.WORKOBJECT) &&
        !this.workObjektLabels.map((e) => e.name).includes(name)
      ) {
        const iconName = element.type.replace(elementTypes.WORKOBJECT, '');
        const rawSrc = this.iconDictionaryService.getIconSource(iconName);
        if (!rawSrc) {
          return;
        }
        let icon: SafeUrl;
        if (rawSrc.startsWith('data')) {
          icon = this.domSanitizer.bypassSecurityTrustUrl(rawSrc);
        } else {
          icon = this.domSanitizer.bypassSecurityTrustUrl(
            'data:image/svg+xml,' + rawSrc
          );
        }
        this.workObjektLabels.push({
          name,
          originalName: name,
          icon,
        });
      }
    });
    this.activityLabels.sort((a, b) => {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
    this.workObjektLabels.sort((a, b) => {
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
  }

  public cleanDictionaries(): void {
    this.activityLabels = [];
    this.workObjektLabels = [];
    this.createLabelDictionaries();
  }

  public getActivityLabels(): LabelEntry[] {
    return this.activityLabels.slice();
  }

  public getWorkObjectLabels(): WorkObjectLabelEntry[] {
    return this.workObjektLabels.slice();
  }

  public massRenameLabels(
    activityNames: string[],
    originalActivityNames: string[],
    workObjectNames: string[],
    originalWorkObjectNames: string[]
  ): void {
    for (let i = 0; i < originalActivityNames.length; i++) {
      if (!activityNames[i]) {
        activityNames[i] = '';
      }
      if (!(activityNames[i] == originalActivityNames[i])) {
        this.massNamingService.massChangeNames(
          originalActivityNames[i],
          activityNames[i],
          elementTypes.ACTIVITY
        );
      }
    }
    for (let i = 0; i < originalWorkObjectNames.length; i++) {
      if (!workObjectNames[i]) {
        workObjectNames[i] = '';
      }
      if (!(workObjectNames[i] == originalWorkObjectNames[i])) {
        this.massNamingService.massChangeNames(
          originalWorkObjectNames[i],
          workObjectNames[i],
          elementTypes.WORKOBJECT
        );
      }
    }
  }
}

import { Injectable } from '@angular/core';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { ElementTypes } from 'src/app/domain/entities/elementTypes';
import { MassNamingService } from 'src/app/tools/label-dictionary/services/mass-naming.service';
import { IconDictionaryService } from '../../icon-set-config/services/icon-dictionary.service';
import { WorkObjectLabelEntry } from '../domain/workObjectLabelEntry';
import { LabelEntry } from '../domain/labelEntry';
import { MatDialogConfig } from '@angular/material/dialog';
import { LabelDictionaryDialogComponent } from '../presentation/label-dictionary-dialog/label-dictionary-dialog.component';
import {
  SNACKBAR_DURATION,
  SNACKBAR_INFO,
} from '../../../domain/entities/constants';
import { DialogService } from '../../../domain/services/dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanvasObject } from '../../../domain/entities/canvasObject';

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
    private dialogService: DialogService,
    private snackbar: MatSnackBar,
  ) {}

  openLabelDictionary() {
    const isActivityWithLabel = (element: CanvasObject) =>
      element.type.includes(ElementTypes.ACTIVITY) &&
      element.businessObject.name;
    const isWorkObjectWithLabel = (element: CanvasObject) =>
      element.type.includes(ElementTypes.WORKOBJECT) &&
      element.businessObject.name;

    const hasAtLeastOneLabel = this.elementRegistryService
      .getAllCanvasObjects()
      .some(
        (element) =>
          isActivityWithLabel(element) || isWorkObjectWithLabel(element),
      );
    if (hasAtLeastOneLabel) {
      const config = new MatDialogConfig();
      config.disableClose = false;
      config.autoFocus = true;

      this.dialogService.openDialog(LabelDictionaryDialogComponent, config);
    } else {
      this.snackbar.open(
        'There are currently no activities or work objects with labels on the canvas',
        undefined,
        {
          duration: SNACKBAR_DURATION * 3,
          panelClass: SNACKBAR_INFO,
        },
      );
    }
  }

  createLabelDictionaries(): void {
    this.activityLabels = [];
    this.workObjektLabels = [];

    const allObjects = this.elementRegistryService.getAllCanvasObjects();

    allObjects.forEach((element) => {
      const name = element.businessObject.name;
      if (
        name &&
        name.length > 0 &&
        element.type.includes(ElementTypes.ACTIVITY) &&
        !this.activityLabels.map((a) => a.name).includes(name)
      ) {
        this.activityLabels.push({
          name,
          originalName: name,
        });
      } else if (
        name &&
        name.length > 0 &&
        element.type.includes(ElementTypes.WORKOBJECT) &&
        !this.workObjektLabels.map((e) => e.name).includes(name)
      ) {
        const iconName = element.type.replace(ElementTypes.WORKOBJECT, '');
        let icon = this.iconDictionaryService.getIconSource(iconName);
        if (!icon) {
          return;
        }
        if (!icon.startsWith('data')) {
          icon = 'data:image/svg+xml,' + icon;
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

  getActivityLabels(): LabelEntry[] {
    return this.activityLabels.slice();
  }

  getWorkObjectLabels(): WorkObjectLabelEntry[] {
    return this.workObjektLabels.slice();
  }

  getUniqueWorkObjectNames(): String[] {
    const workObjects = this.elementRegistryService.getAllWorkobjects();
    return [
      ...new Set(
        workObjects
          .filter((workObject) => {
            return !!workObject.businessObject.name;
          })
          .map((workObject) => workObject.businessObject.name),
      ),
    ];
  }

  massRenameLabels(
    activityNames: string[],
    originalActivityNames: string[],
    workObjectNames: string[],
    originalWorkObjectNames: string[],
  ): void {
    for (let i = 0; i < originalActivityNames.length; i++) {
      if (!activityNames[i]) {
        activityNames[i] = '';
      }
      if (!(activityNames[i] == originalActivityNames[i])) {
        this.massNamingService.massChangeNames(
          originalActivityNames[i],
          activityNames[i],
          ElementTypes.ACTIVITY,
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
          ElementTypes.WORKOBJECT,
        );
      }
    }
  }
}

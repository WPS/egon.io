import { inject, Injectable } from '@angular/core';

import {
  SNACKBAR_DURATION,
  SNACKBAR_DURATION_LONGER,
  SNACKBAR_ERROR,
  SNACKBAR_INFO,
  SNACKBAR_SUCCESS,
} from '../../../domain/entities/constants';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class IconSetNotificationService {
  private readonly snackbar = inject(MatSnackBar);

  public openConfigurationImportOrSavedSnackbar(imported: boolean) {
    this.snackbar.open(
      imported
        ? 'Configuration imported successfully'
        : 'Configuration saved successfully & Autosave created',
      undefined,
      {
        duration: SNACKBAR_DURATION,
        panelClass: SNACKBAR_SUCCESS,
      },
    );
  }

  public openAlreadyUsedIconsSnackbar(
    changedActors: string[],
    changedWorkObjects: string[],
  ) {
    if (changedActors.length && !changedWorkObjects.length) {
      const actors = changedActors.join(', ');
      this.snackbar.open(
        `The following icons are already in use as actors and cannot be changed: ${actors}`,
        undefined,
        {
          duration: SNACKBAR_DURATION_LONGER,
          panelClass: SNACKBAR_ERROR,
        },
      );
    } else if (changedWorkObjects.length && !changedActors.length) {
      const workObjects = changedWorkObjects.join(', ');
      this.snackbar.open(
        `The following icons are already in use as work objects and cannot be changed: ${workObjects}`,
        undefined,
        {
          duration: SNACKBAR_DURATION_LONGER,
          panelClass: SNACKBAR_ERROR,
        },
      );
    } else {
      const workObjects = changedWorkObjects.join(', ');
      const actors = changedActors.join(', ');
      this.snackbar.open(
        `The following icons are already in use as actors and cannot be changed: ${actors} & ` +
          `the following icons are already in use as work objects and cannot be changed: ${workObjects}`,
        undefined,
        {
          duration: SNACKBAR_DURATION_LONGER,
          panelClass: SNACKBAR_ERROR,
        },
      );
    }
  }

  public openNoImportOrNoSaveSnackbar(imported: boolean): void {
    this.snackbar.open(
      imported
        ? 'No configuration to be imported'
        : 'No configuration to be saved',
      undefined,
      {
        duration: SNACKBAR_DURATION,
        panelClass: SNACKBAR_INFO,
      },
    );
  }
}

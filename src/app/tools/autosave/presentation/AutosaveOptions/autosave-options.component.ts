import { Component } from '@angular/core';
import { AutosaveConfigurationService } from '../../services/autosave-configuration.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SNACKBAR_DURATION,
  SNACKBAR_ERROR,
  SNACKBAR_SUCCESS,
} from 'src/app/domain/entities/constants';

@Component({
  selector: 'app-autosave-options',
  templateUrl: './autosave-options.component.html',
  styleUrls: ['./autosave-options.component.scss'],
  standalone: false,
})
export class AutosaveOptionsComponent {
  constructor(
    protected autosaveConfiguration: AutosaveConfigurationService,
    private snackbar: MatSnackBar,
  ) {}

  save(activated: boolean, maxDrafts: number, interval: number) {
    if (
      this.autosaveConfiguration.setConfiguration({
        activated,
        maxDrafts,
        interval,
      })
    ) {
      this.snackbar.open('Settings for Autosave saved', undefined, {
        duration: SNACKBAR_DURATION,
        panelClass: SNACKBAR_SUCCESS,
      });
    } else {
      this.snackbar.open(
        'Unable to save settings for Autosave - please try again',
        undefined,
        {
          duration: 2 * SNACKBAR_DURATION,
          panelClass: SNACKBAR_ERROR,
        },
      );
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { AutosaveService } from '../../Service/Autosave/autosave.service';
import { Autosave } from '../../Domain/Autosave/autosave';
import { AutosaveStateService } from '../../Service/Autosave/autosave-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SNACKBAR_DURATION,
  SNACKBAR_ERROR,
  SNACKBAR_SUCCESS,
} from 'src/app/Domain/Common/constants';

@Component({
  selector: 'app-autosave-settings',
  templateUrl: './autosave-settings.component.html',
  styleUrls: ['./autosave-settings.component.scss'],
})
export class AutosaveSettingsComponent implements OnInit {
  autosaves: Autosave[] = [];

  constructor(
    private autosaveService: AutosaveService,
    protected autosaveStateService: AutosaveStateService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.autosaves = this.autosaveService.loadCurrentAutosaves();
  }

  loadAutosave(autosave: Autosave): void {
    this.autosaveService.loadAutosave(autosave);
  }

  save(activated: boolean, amount: number, interval: number) {
    if (this.autosaveStateService.setState({ activated, amount, interval })) {
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
        }
      );
    }
  }
}

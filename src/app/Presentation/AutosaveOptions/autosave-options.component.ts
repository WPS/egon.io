import { Component } from '@angular/core';
import { AutosaveStateService } from '../../Service/Autosave/autosave-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_DURATION, SNACKBAR_ERROR, SNACKBAR_SUCCESS } from 'src/app/Domain/Common/constants';

@Component({
  selector: 'app-autosave-options',
  templateUrl: './autosave-options.component.html',
  styleUrls: ['./autosave-options.component.scss'],
})
export class AutosaveOptionsComponent {

  constructor(
    protected autosaveStateService: AutosaveStateService,
    private snackbar: MatSnackBar
  ) { }

  save(activated: boolean, amount: number, interval: number) {
    if (this.autosaveStateService.setState({ activated, amount, interval })) {
      this.snackbar.open('Settings for Autosave saved', undefined, {
        duration: SNACKBAR_DURATION,
        panelClass: SNACKBAR_SUCCESS
      });
    } else {
      this.snackbar.open('Unable to save settings for Autosave - please try again', undefined, {
        duration: 2 * SNACKBAR_DURATION,
        panelClass: SNACKBAR_ERROR
      });
    }
  }
}

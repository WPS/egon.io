import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/overlay';
import { InfoDialogData } from '../entities/infoDialogData';
import { InfoDialogComponent } from '../presentation/info-dialog/info-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private matDialog: MatDialog) {}

  openDialog(dialog: ComponentType<any>, config: MatDialogConfig): void {
    this.matDialog.open(dialog, config);
  }

  openKeyboardShortcutsDialog(): void {
    const title = 'Keyboard Shortcuts';
    const shortCutText =
      'Undo:\t\t\t\t\tctrl + Z \n' +
      'Redo:\t\t\t\t\tctrl + Y    OR   ctrl + shift + Z\n' +
      'Select All:\t\t\t\tctrl + A\n' +
      'Export as EGN:\t\t\tctrl + S\n' +
      'Import Domain Story: \tctrl + L\n' +
      'Search for text:\t\t\tctrl + F\n' +
      'Direct editing:\t\t\tE\n' +
      'Hand tool:\t\t\t\tH\n' +
      'Lasso tool:\t\t\t\tL\n' +
      'Space tool:\t\t\t\tS';

    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;

    config.data = new InfoDialogData(title, shortCutText, true);

    this.openDialog(InfoDialogComponent, config);
  }
}

import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private matDialog: MatDialog) {}

  openDialog(dialog: ComponentType<any>, config: MatDialogConfig): void {
    this.matDialog.open(dialog, config);
  }
}

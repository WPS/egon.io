import { Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-label-dictionary-dialog',
  templateUrl: './label-dictionary-dialog.component.html',
  styleUrls: ['./label-dictionary-dialog.component.scss'],
})
export class LabelDictionaryDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<LabelDictionaryDialogComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-label-dictionary-dialog',
  templateUrl: './label-dictionary-dialog.component.html',
  styleUrls: ['./label-dictionary-dialog.component.scss'],
  standalone: false,
})
export class LabelDictionaryDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<LabelDictionaryDialogComponent>,
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}

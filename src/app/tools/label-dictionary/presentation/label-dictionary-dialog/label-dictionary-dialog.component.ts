import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { LabelDictionaryComponent } from '../label-dictionary/label-dictionary.component';

@Component({
  selector: 'app-label-dictionary-dialog',
  templateUrl: './label-dictionary-dialog.component.html',
  styleUrls: ['./label-dictionary-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, LabelDictionaryComponent],
})
export class LabelDictionaryDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<LabelDictionaryDialogComponent>,
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}

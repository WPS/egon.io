import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LabelDictionaryComponent } from '../label-dictionary/label-dictionary.component';

@Component({
  selector: 'app-label-dictionary-dialog',
  templateUrl: './label-dictionary-dialog.component.html',
  styleUrls: ['./label-dictionary-dialog.component.scss'],

  imports: [MatDialogModule, LabelDictionaryComponent],
})
export class LabelDictionaryDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<LabelDictionaryDialogComponent>,
  );

  close(): void {
    this.dialogRef.close();
  }
}

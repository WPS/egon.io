import { Component, inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-external-resources-warning-dialog',
  imports: [MatButton, MatDialogActions, MatDialogContent],
  templateUrl: './external-resources-warning-dialog.component.html',
  styleUrl: './external-resources-warning-dialog.component.scss',
})
export class ExternalResourcesWarningDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<ExternalResourcesWarningDialogComponent>,
  );
  private readonly fn: any = inject(MAT_DIALOG_DATA);

  protected close(): void {
    this.dialogRef.close();
  }

  protected doImport(): void {
    this.fn();
    this.close();
  }
}

import { Component, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],

  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class ImportDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ImportDialogComponent>);
  private readonly fn: any = inject(MAT_DIALOG_DATA);

  protected readonly fileUrl = signal('');

  protected doImport(): void {
    this.fn(this.fileUrl());
    this.close();
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected updateUrl($event: Event) {
    const target = $event.target as HTMLInputElement;
    this.fileUrl.set(target.value);
  }
}

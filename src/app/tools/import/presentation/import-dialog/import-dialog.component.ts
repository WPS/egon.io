import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class ImportDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ImportDialogComponent>);
  private readonly fn: any = inject(MAT_DIALOG_DATA);

  protected readonly fileUrl = new BehaviorSubject<string>('');

  protected doImport(): void {
    this.fn(this.fileUrl.value);
    this.close();
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected updateUrl($event: Event) {
    const target = $event.target as HTMLInputElement;
    this.fileUrl.next(target.value);
  }
}

import { Component, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  ExportDialogData,
  ExportOption,
} from 'src/app/tools/export/domain/dialog/exportDialogData';

import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],

  imports: [
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatCheckbox,
    ReactiveFormsModule,
  ],
})
export class ExportDialogComponent {
  private readonly dialogRef: MatDialogRef<ExportDialogComponent> = inject(
    MatDialogRef<ExportDialogComponent>,
  );
  private readonly data: ExportDialogData = inject(MAT_DIALOG_DATA);

  protected readonly title: string = this.data.title;
  protected readonly defaultFileName: string = this.data.defaultFilename;
  protected readonly options: ExportOption[] = this.data.options;

  protected readonly withTitle = signal(true);
  protected readonly useWhiteBackground = signal(true);
  protected readonly isAnimatedSvgExport = signal(false);
  protected animationSpeed: number = 2;
  protected filename: string = '';

  protected doOption(index: number): void {
    this.options[index].fn(
      this.determineFilename(),
      this.withTitle(),
      this.useWhiteBackground(),
      this.isAnimatedSvgExport() ? this.animationSpeed : undefined,
    );
    this.close();
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected updateWithTitle(checked: boolean) {
    this.withTitle.set(checked);
  }

  protected updateUseWhiteBackground(checked: boolean) {
    this.useWhiteBackground.set(checked);
  }

  protected onExportAnimatedSvg(checked: boolean): void {
    this.isAnimatedSvgExport.set(checked);
  }

  protected updateFileName($event: Event) {
    const target = $event.target as HTMLInputElement;
    this.filename = target.value;
  }

  private determineFilename() {
    if (this.filename && this.filename.length > 0) {
      return this.filename;
    }
    return this.defaultFileName;
  }
}

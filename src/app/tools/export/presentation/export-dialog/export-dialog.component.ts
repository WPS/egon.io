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

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
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

  protected readonly withTitle$ = signal(true);
  protected readonly useWhiteBackground$ = signal(true);
  protected readonly animationSpeed: number = 2;
  protected isAnimatedSvgExport: boolean = false;
  protected filename: string = '';

  protected doOption(i: number): void {
    if (this.isAnimatedSvgExport) {
      this.options[i].fn(
        this.determineFilename(),
        this.withTitle$(),
        this.useWhiteBackground$(),
        this.animationSpeed,
      );
    } else {
      this.options[i].fn(
        this.determineFilename(),
        this.withTitle$(),
        this.useWhiteBackground$(),
      );
    }
    this.close();
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected updateWithTitle($event: Event) {
    const target = $event.target as HTMLInputElement;
    this.withTitle$.set(target.checked);
  }

  protected updateUseWhiteBackground($event: Event) {
    const target = $event.target as HTMLInputElement;
    this.useWhiteBackground$.set(target.checked);
  }

  protected onExportAnimatedSvg(): void {
    this.isAnimatedSvgExport = !this.isAnimatedSvgExport;
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

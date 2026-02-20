import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  ExportDialogData,
  ExportOption,
} from 'src/app/tools/export/domain/dialog/exportDialogData';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule],
})
export class ExportDialogComponent {
  private readonly dialogRef: MatDialogRef<ExportDialogComponent> = inject(
    MatDialogRef<ExportDialogComponent>,
  );
  private readonly data: ExportDialogData = inject(MAT_DIALOG_DATA);

  protected readonly title: string = this.data.title;
  protected readonly options: ExportOption[] = this.data.options;

  protected readonly withTitle = new BehaviorSubject<boolean>(true);
  protected readonly useWhiteBackground = new BehaviorSubject<boolean>(true);
  protected readonly animationSpeed: number = 2;
  protected isAnimatedSvgExport: boolean = false;

  protected doOption(i: number): void {
    if (this.isAnimatedSvgExport) {
      this.options[i].fn(
        this.withTitle.value,
        this.useWhiteBackground.value,
        this.animationSpeed,
      );
    } else {
      this.options[i].fn(this.withTitle.value, this.useWhiteBackground.value);
    }
    this.close();
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected updateWithTitle($event: Event) {
    const target = $event.target as HTMLInputElement;
    this.withTitle.next(target.checked);
  }

  protected updateUseWhiteBackground($event: Event) {
    const target = $event.target as HTMLInputElement;
    this.useWhiteBackground.next(target.checked);
  }

  protected onExportAnimatedSvg(): void {
    this.isAnimatedSvgExport = !this.isAnimatedSvgExport;
  }
}

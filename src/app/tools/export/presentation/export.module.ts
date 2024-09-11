import { ExportDialogComponent } from './export-dialog/export-dialog.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ExportDialogComponent],
  exports: [ExportDialogComponent],
  imports: [CommonModule, MaterialModule, FormsModule],
})
export class ExportModule {}

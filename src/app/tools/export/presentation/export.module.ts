import { ExportDialogComponent } from './export-dialog/export-dialog.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [ExportDialogComponent],
  exports: [ExportDialogComponent],
  imports: [CommonModule, MaterialModule],
})
export class ExportModule {}

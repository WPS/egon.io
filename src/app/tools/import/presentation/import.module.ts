import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ImportDialogComponent } from './import-dialog/import-dialog.component';

@NgModule({
  declarations: [ImportDialogComponent],
  exports: [ImportDialogComponent],
  imports: [CommonModule, MaterialModule],
})
export class ImportModule {}

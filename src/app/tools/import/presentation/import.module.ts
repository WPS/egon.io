import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ImportUrlDialogComponent } from './import-url-dialog/import-url-dialog.component';

@NgModule({
  declarations: [ImportUrlDialogComponent],
  exports: [ImportUrlDialogComponent],
  imports: [CommonModule, MaterialModule],
})
export class ImportModule {}

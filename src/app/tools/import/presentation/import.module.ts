import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ImportUrlDialogComponent } from './import-url-dialog/import-url-dialog.component';
import { ImportDropboxDialogComponent } from './import-dropbox-dialog/import-dropbox-dialog.component';

@NgModule({
  declarations: [ImportUrlDialogComponent, ImportDropboxDialogComponent],
  exports: [ImportUrlDialogComponent, ImportDropboxDialogComponent],
  imports: [CommonModule, MaterialModule],
})
export class ImportModule {}

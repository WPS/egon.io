import { NgModule } from '@angular/core';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';

@NgModule({
  declarations: [InfoDialogComponent],
  exports: [InfoDialogComponent],
  imports: [CommonModule, MaterialModule],
})
export class DomainModule {}

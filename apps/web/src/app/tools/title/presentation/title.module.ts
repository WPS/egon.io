import { NgModule } from '@angular/core';
import { TitleDialogComponent } from './title-dialog/title-dialog.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [TitleDialogComponent],
  exports: [TitleDialogComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
})
export class TitleModule {}

import { NgModule } from '@angular/core';
import { ActivityDialogComponent } from './activity-dialog/activity-dialog.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ActivityDialogComponent],
  exports: [ActivityDialogComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
})
export class ModelerModule {}

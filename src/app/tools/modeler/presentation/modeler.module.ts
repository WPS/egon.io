import { NgModule } from '@angular/core';
import { ActivityDialogComponent } from './activity-dialog/activity-dialog.component';
import { ModelerComponent } from './modeler/modeler.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ActivityDialogComponent, ModelerComponent],
  exports: [ActivityDialogComponent, ModelerComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
})
export class ModelerModule {}

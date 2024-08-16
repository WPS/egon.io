import { NgModule } from '@angular/core';
import { ActivityDialogComponent } from './activity-dialog/activity-dialog.component';
import { ModelerComponent } from './modeler/modeler.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDirective } from '../../import/directive/dragDrop.directive';

@NgModule({
  declarations: [ActivityDialogComponent, ModelerComponent],
  exports: [ActivityDialogComponent, ModelerComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, DragDirective],
})
export class ModelerModule {}

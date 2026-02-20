import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivityDialogData } from 'src/app/tools/modeler/domain/activityDialogData';
import { ActivityCanvasObject } from '../../../../domain/entities/activityCanvasObject';
import { ActivityDialogForm } from '../../domain/activity-dialog-form';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-activity-dialog',
  templateUrl: './activity-dialog.component.html',
  styleUrls: ['./activity-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class ActivityDialogComponent {
  form: FormGroup<ActivityDialogForm>;
  activityLabel: string;
  activityNumber: number | null;
  numberIsAllowedMultipleTimes: boolean;
  showNumberFields: boolean;
  activity: ActivityCanvasObject;

  saveFN: any;

  private dialogRef = inject(MatDialogRef<ActivityDialogComponent>);

  constructor() {
    const data = inject<ActivityDialogData>(MAT_DIALOG_DATA);
    this.activity = data.activity;
    this.activityLabel = data.activity.businessObject.name;
    this.numberIsAllowedMultipleTimes = data.numberIsAllowedMultipleTimes;
    this.activityNumber = data.activity.businessObject.number ?? null;
    this.showNumberFields = data.showNumberFields;

    this.saveFN = data.saveFN;

    this.form = ActivityDialogForm.create(
      this.activityLabel,
      this.activityNumber,
      this.numberIsAllowedMultipleTimes,
    );

    this.form.controls.activityNumber.valueChanges.subscribe(
      (activityNumber) => {
        if (activityNumber !== null) {
          if (activityNumber < 1) {
            this.form.controls.activityNumber.setValue(1);
          }
        }
      },
    );
  }

  onSubmit(): void {
    this.numberIsAllowedMultipleTimes = !this.numberIsAllowedMultipleTimes;
    this.form.patchValue({
      multipleNumbers: this.numberIsAllowedMultipleTimes,
    });
  }

  save(): void {
    this.saveFN({
      activity: this.activity,
      ...this.form.value,
    });
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }

  preventDefault(event: Event) {
    event.preventDefault();
  }
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { ActivityDialogData } from 'src/app/tools/modeler/domain/activityDialogData';
import { ActivityCanvasObject } from '../../../../domain/entities/activityCanvasObject';
import { ActivityDialogForm } from '../../domain/activity-dialog-form';

@Component({
  selector: 'app-activity-dialog',
  templateUrl: './activity-dialog.component.html',
  styleUrls: ['./activity-dialog.component.scss'],
  standalone: false,
})
export class ActivityDialogComponent {
  form: FormGroup<ActivityDialogForm>;
  activityLabel: string;
  activityNumber: number | null;
  numberIsAllowedMultipleTimes: boolean;
  showNumberFields: boolean;
  activity: ActivityCanvasObject;

  saveFN: any;

  constructor(
    private dialogRef: MatDialogRef<ActivityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ActivityDialogData,
  ) {
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

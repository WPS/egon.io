import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivityDialogData } from 'src/app/Domain/Dialog/activityDialogData';
import { ActivityCanvasObject } from '../../../Domain/Common/activityCanvasObject';

@Component({
  selector: 'app-activity-dialog',
  templateUrl: './activity-dialog.component.html',
  styleUrls: ['./activity-dialog.component.scss'],
})
export class ActivityDialogComponent {
  form: UntypedFormGroup;
  activityLabel: string;
  activityNumber: number | undefined;
  numberIsAllowedMultipleTimes: boolean;
  showNumberFields: boolean;
  activity: ActivityCanvasObject;

  saveFN: any;

  constructor(
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<ActivityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ActivityDialogData
  ) {
    this.activity = data.activity;
    this.activityLabel = data.activity.businessObject.name;
    this.numberIsAllowedMultipleTimes = data.numberIsAllowedMultipleTimes;
    this.activityNumber = data.activity.businessObject.number;
    this.showNumberFields = data.showNumberFields;

    this.saveFN = data.saveFN;

    this.form = this.fb.group({
      activityLabel: [this.activityLabel, []],
      activityNumber: [this.activityNumber, []],
      multipleNumbers: [this.numberIsAllowedMultipleTimes, []],
    });
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
}

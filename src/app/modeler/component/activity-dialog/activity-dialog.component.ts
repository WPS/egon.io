import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivityDialogData } from 'src/app/modeler/component/activity-dialog/activityDialogData';
import { CanvasObject } from 'src/app/common/domain/canvasObject';
import { ActivityCanvasObject } from '../../../common/domain/activityCanvasObject';

@Component({
  selector: 'app-activity-dialog',
  templateUrl: './activity-dialog.component.html',
  styleUrls: ['./activity-dialog.component.scss'],
})
export class ActivityDialogComponent implements OnInit {
  form: FormGroup;
  activityLabel: string;
  activityNumber: number | undefined;
  numberIsAllowedMultipleTimes: boolean;
  showNumberFields: boolean;
  activity: ActivityCanvasObject;

  saveFN: any;

  constructor(
    private fb: FormBuilder,
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

  ngOnInit(): void {}

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

import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivityDialogData } from 'src/app/tools/modeler/domain/activityDialogData';
import { ActivityDialogForm } from '../../domain/activity-dialog-form';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-activity-dialog',
  templateUrl: './activity-dialog.component.html',
  styleUrls: ['./activity-dialog.component.scss'],

  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckbox,
  ],
})
export class ActivityDialogComponent {
  private dialogRef = inject(MatDialogRef<ActivityDialogComponent>);
  private readonly data = inject<ActivityDialogData>(MAT_DIALOG_DATA);

  readonly activity = this.data.activity;
  readonly activityLabel = this.data.activity.businessObject.name;
  numberIsAllowedMultipleTimes = this.data.numberIsAllowedMultipleTimes;
  activityNumber: number | null =
    this.data.activity.businessObject.number ?? null;
  readonly showNumberFields = this.data.showNumberFields;
  readonly saveFN = this.data.saveFN;

  readonly form: FormGroup<ActivityDialogForm> = ActivityDialogForm.create(
    this.activityLabel,
    this.activityNumber,
    this.numberIsAllowedMultipleTimes,
  );

  constructor() {
    this.form.controls.activityNumber.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((activityNumber) => {
        if (activityNumber !== null) {
          if (activityNumber < 1) {
            this.form.controls.activityNumber.setValue(1);
          }
        }
      });
  }

  onSubmit(): void {
    this.numberIsAllowedMultipleTimes = !this.numberIsAllowedMultipleTimes;
    this.form.patchValue({
      multipleNumbers: this.numberIsAllowedMultipleTimes,
    });
  }

  save(): void {
    let activityNumber: number | undefined;
    if(this.form.value.activityNumber !== null) {
      activityNumber = this.form.value.activityNumber;
    }
    this.saveFN({
      activity: this.activity,
      activityNumber,
      activityLabel: this.form.value.activityLabel,
      multipleNumbers: this.form.value.multipleNumbers,
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

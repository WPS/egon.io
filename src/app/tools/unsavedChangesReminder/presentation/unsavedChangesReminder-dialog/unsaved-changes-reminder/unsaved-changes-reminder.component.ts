import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-unsaved-changes-reminder',

  imports: [MatButton, MatDialogActions, MatDialogContent],
  templateUrl: './unsaved-changes-reminder.component.html',
  styleUrl: './unsaved-changes-reminder.component.scss',
})
export class UnsavedChangesReminderComponent {
  private readonly dialogRef = inject(
    MatDialogRef<UnsavedChangesReminderComponent>,
  );
  readonly fn = inject(MAT_DIALOG_DATA);

  continueAction(): void {
    this.fn();
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}

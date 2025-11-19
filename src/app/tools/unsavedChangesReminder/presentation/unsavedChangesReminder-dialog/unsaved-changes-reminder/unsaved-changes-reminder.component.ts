import { Component, Inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-unsaved-changes-reminder',
  standalone: true,
  imports: [MatButton, MatDialogActions, MatDialogContent],
  templateUrl: './unsaved-changes-reminder.component.html',
  styleUrl: './unsaved-changes-reminder.component.scss',
})
export class UnsavedChangesReminderComponent implements OnInit {
  fn: any;

  constructor(
    private dialogRef: MatDialogRef<UnsavedChangesReminderComponent>,
    @Inject(MAT_DIALOG_DATA) data: () => {},
  ) {
    this.fn = data;
  }

  ngOnInit(): void {}

  continueAction(): void {
    this.fn();
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}

import { Component, inject, OnInit } from '@angular/core';
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

  private dialogRef = inject(MatDialogRef<UnsavedChangesReminderComponent>);

  constructor() {
    this.fn = inject(MAT_DIALOG_DATA);
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

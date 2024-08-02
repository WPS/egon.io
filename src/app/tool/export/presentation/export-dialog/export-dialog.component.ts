import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExportDialogData } from 'src/app/Domain/Dialog/exportDialogData';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent implements OnInit {
  title: string;
  options: {
    text: string;
    tooltip: string;
    fn: any;
  }[];
  withTitle: BehaviorSubject<boolean>;
  useWhiteBackground: BehaviorSubject<boolean>;

  constructor(
    private dialogRef: MatDialogRef<ExportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ExportDialogData,
  ) {
    this.withTitle = new BehaviorSubject<boolean>(true);
    this.useWhiteBackground = new BehaviorSubject<boolean>(true);
    this.title = data.title;
    this.options = data.options;
  }

  ngOnInit(): void {}

  doOption(i: number): void {
    this.options[i].fn(this.withTitle.value, this.useWhiteBackground.value);
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }

  updateWithTitle($event: Event) {
    // @ts-ignore
    this.withTitle.next($event.target.checked);
  }

  updateUseWhiteBackground($event: Event) {
    // @ts-ignore
    this.useWhiteBackground.next($event.target.checked);
  }
}

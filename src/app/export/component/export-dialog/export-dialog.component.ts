import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExportDialogData } from 'src/app/export/component/export-dialog/exportDialogData';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent implements OnInit {
  title: string;
  options: {
    text: string;
    fn: any;
  }[];

  constructor(
    private dialogRef: MatDialogRef<ExportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ExportDialogData
  ) {
    this.title = data.title;
    this.options = data.options;
  }

  ngOnInit(): void {}

  doOption(i: number): void {
    this.options[i].fn();
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}

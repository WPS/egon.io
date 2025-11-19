import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],
  standalone: false,
})
export class ImportDialogComponent implements OnInit {
  fn: any;
  fileUrl: BehaviorSubject<string>;

  constructor(
    private dialogRef: MatDialogRef<ImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: () => {},
  ) {
    this.fileUrl = new BehaviorSubject<string>('');
    this.fn = data;
  }

  ngOnInit(): void {}

  doImport(): void {
    this.fn(this.fileUrl.value);
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }

  updateUrl($event: Event) {
    // @ts-ignore
    this.fileUrl.next($event.target.value);
  }
}

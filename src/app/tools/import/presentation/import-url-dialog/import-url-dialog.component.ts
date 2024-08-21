import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-url-dialog.component.html',
  styleUrls: ['./import-url-dialog.component.scss'],
})
export class ImportUrlDialogComponent implements OnInit {
  fn: any;
  fileUrl: BehaviorSubject<string>;

  constructor(
    private dialogRef: MatDialogRef<ImportUrlDialogComponent>,
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

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InfoDialogData } from 'src/app/Presentation/Dialog/info-dialog/infoDialogData';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss'],
})
export class InfoDialogComponent implements OnInit {
  title: string;
  infoText: string;
  showConfirmButton: boolean;
  hasLink: boolean;
  linkText: string;

  constructor(
    private dialogRef: MatDialogRef<InfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: InfoDialogData
  ) {
    this.title = data.title;
    this.infoText = data.infoText;
    this.showConfirmButton = !data.isInfo;
    this.hasLink = data.isLink;
    this.linkText = data.linkText || '';
  }

  ngOnInit(): void {}

  close(): void {
    this.dialogRef.close();
  }
}

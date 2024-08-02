import { AfterViewInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InfoDialogData } from 'src/app/Domain/Dialog/infoDialogData';

@Component({
  selector: 'app-title-and-description-dialog',
  templateUrl: './title-and-description-dialog.component.html',
  styleUrls: ['./title-and-description-dialog.component.scss'],
})
export class TitleAndDescriptionDialogComponent implements AfterViewInit {
  title: string;
  infoText: string;
  showConfirmButton: boolean;
  hasLink: boolean;
  linkText: string;

  constructor(
    private dialogRef: MatDialogRef<TitleAndDescriptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: InfoDialogData,
  ) {
    this.title = data.title;
    this.infoText = data.infoText;
    this.showConfirmButton = !data.isInfo;
    this.hasLink = data.isLink;
    this.linkText = data.linkText || '';
  }

  ngAfterViewInit() {
    const span = document.getElementsByClassName(
      'readOnlyText',
    )[0] as HTMLTextAreaElement;
    span.style.height = span.scrollHeight + 'px';
  }

  close(): void {
    this.dialogRef.close();
  }
}

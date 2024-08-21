import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { AsyncPipe, NgForOf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import {
  DropboxService,
  FileItem,
} from '../../../export/services/dropbox.service';
import { ImportDomainStoryService } from '../../services/import-domain-story.service';

@Component({
  selector: 'app-import-dropbox-dialog',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    NgForOf,
    FormsModule,
    MatRadioGroup,
    MatRadioButton,
  ],
  templateUrl: './import-dropbox-dialog.component.html',
  styleUrl: './import-dropbox-dialog.component.scss',
})
export class ImportDropboxDialogComponent implements OnInit {
  selectedFile: FileItem | null = null;
  fileItems: FileItem[] = [];
  userEmail: string = '';

  constructor(
    private importDomainStoryService: ImportDomainStoryService,
    private dropboxService: DropboxService,
    private dialogRef: MatDialogRef<ImportDropboxDialogComponent>,
  ) {}

  ngOnInit(): void {
    this.dropboxService
      .getFileItems()
      .then((fileItems) => (this.fileItems = fileItems));
    this.dropboxService
      .getUserEmail()
      .then((email) => (this.userEmail = email));
  }

  doImport(): void {
    this.dropboxService
      .getDownloadLink(this.selectedFile!.pathWithFilename)
      .then((response) => {
        this.importDomainStoryService.importFromUrl(
          response.link,
          this.selectedFile!.filename,
        );
        this.close();
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}

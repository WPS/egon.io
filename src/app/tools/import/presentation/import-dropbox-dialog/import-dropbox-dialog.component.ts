import { Component, OnInit } from '@angular/core';
import { MatDialogRef, } from '@angular/material/dialog';
import { DropboxService, FileItem, } from '../../../export/services/dropbox.service';
import { ImportDomainStoryService } from '../../services/import-domain-story.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_DURATION_LONG, SNACKBAR_ERROR, } from '../../../../domain/entities/constants';

@Component({
  selector: 'app-import-dropbox-dialog',
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
    private snackbar: MatSnackBar,
  ) {
  }

  ngOnInit(): void {
    this.dropboxService
      .getFileItems()
      .then((fileItems) => (this.fileItems = fileItems))
      .catch(() =>
        this.snackbar.open(
          'You should connect to your Dropbox account first',
          undefined,
          {
            duration: SNACKBAR_DURATION_LONG,
            panelClass: SNACKBAR_ERROR,
          },
        ),
      );

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

  selectFileItem(fileItem: FileItem): void {
    if (this.selectedFile === fileItem) {
      this.selectedFile = null;
    } else {
      this.selectedFile = fileItem;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  isSeleced(file: FileItem) {
    return this.selectedFile === file;
  }
}

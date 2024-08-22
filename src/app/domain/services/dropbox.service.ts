import { Injectable } from '@angular/core';
import { Dropbox } from 'dropbox';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SNACKBAR_DURATION,
  SNACKBAR_DURATION_LONG,
  SNACKBAR_DURATION_LONGER,
  SNACKBAR_ERROR,
  SNACKBAR_INFO,
  SNACKBAR_SUCCESS,
} from '../entities/constants';

export interface FileItem {
  filename: string;
  pathWithFilename: string;
}

export interface DownloadLink {
  link: string;
}

@Injectable({
  providedIn: 'root',
})
export class DropboxService {
  private dropbox: Dropbox | null = null;

  constructor(private snackbar: MatSnackBar) {
    this.dropbox = new Dropbox({
      clientId: environment.dropbox_api_key,
      fetch: fetch,
    });
  }

  authenticateUserWithOauth2() {
    window.location.href = `https://www.dropbox.com/oauth2/authorize?client_id=${environment.dropbox_api_key}&response_type=token&redirect_uri=${encodeURIComponent(environment.domainUrl)}`;
  }

  uploadToDropbox(filename: string, svgData: string): void {
    const accessToken = this.getAccessToken();
    if (accessToken === null) {
      this.snackbar.open(
        'If you want to upload a SVG-File to your Dropbox account, you have to connect Egon before',
        undefined,
        {
          duration: SNACKBAR_DURATION_LONG,
          panelClass: SNACKBAR_INFO,
        },
      );
      return;
    }
    this.dropbox = new Dropbox({ accessToken: accessToken });

    this.dropbox
      .filesUpload({ path: '/' + filename, mode: {".tag": 'overwrite'}, autorename: true, contents: svgData })
      .then((response) => {
        this.uploadSvgSuccessful();
      })
      .catch(() => {
        this.uploadNotSuccessful();
      });
  }

  async getDownloadLink(path: string): Promise<DownloadLink> {
    let accessToken = this.getAccessToken();
    this.dropbox = new Dropbox({ accessToken: accessToken! });
    return this.dropbox
      .filesGetTemporaryLink({ path: path })
      .then((response) => {
        const downloadLink: DownloadLink = { link: response.result.link };
        return downloadLink;
      });
  }

  async getUserEmail(): Promise<string> {
    let accessToken = this.getAccessToken();
    this.dropbox = new Dropbox({ accessToken: accessToken! });
    return this.dropbox
      .usersGetCurrentAccount()
      .then((response) => response.result.email);
  }

  getAccessToken(): string | null {
    const hash = window.location.hash;
    const queryString = hash.includes('#') ? hash.split('#')[1] : '';
    const urlSearchParams = new URLSearchParams(queryString);
    return urlSearchParams.get('access_token');
  }

  private uploadSvgSuccessful(): void {
    this.snackbar.open('Upload successful', undefined, {
      duration: SNACKBAR_DURATION,
      panelClass: SNACKBAR_SUCCESS,
    });
  }

  private uploadNotSuccessful(): void {
    this.snackbar
      .open(`Failed to upload file!`, 'Try to reconnect to Dropbox', {
        duration: SNACKBAR_DURATION_LONGER,
        panelClass: SNACKBAR_ERROR,
      })
      .onAction()
      .subscribe(() => this.authenticateUserWithOauth2());
  }

  public async getFileItems(): Promise<FileItem[]> {
    try {
      const accessToken = this.getAccessToken()!;
      this.dropbox = new Dropbox({ accessToken: accessToken });
      return this.dropbox.filesListFolder({ path: '' }).then((response) => {
        return response.result.entries.map((entry) => {
          const fileItem: FileItem = {
            filename: entry.name,
            pathWithFilename: entry.path_lower!,
          };
          return fileItem;
        });
      });
    } catch (error) {
      this.snackbar.open(
        'Failed to load file entries from Dropbox',
        undefined,
        {
          duration: SNACKBAR_DURATION_LONG,
          panelClass: SNACKBAR_ERROR,
        },
      );
      throw new Error('Failed to load file entries from Dropbox');
    }
  }
}

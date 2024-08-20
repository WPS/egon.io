import { Injectable } from '@angular/core';
import {Dropbox} from "dropbox";
import {environment} from "../../../../environments/environment";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  SNACKBAR_DURATION,
  SNACKBAR_DURATION_LONG, SNACKBAR_ERROR,
  SNACKBAR_INFO,
  SNACKBAR_SUCCESS
} from "../../../domain/entities/constants";

@Injectable({
  providedIn: 'root'
})
export class DropboxService {

  private dropbox: Dropbox | null = null
  private accessToken: string | null = null

  constructor(private snackbar: MatSnackBar) {
    this.dropbox = new Dropbox({
      clientId: environment.dropbox_api_key,
      fetch: fetch
    })
  }

  authenticateUserWithOauth2() {
    const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${environment.dropbox_api_key}&response_type=token&redirect_uri=${encodeURIComponent('http://localhost:4200/')}`;
    window.location.href = authUrl;
  }

  uploadToDropbox(filename: string, svgData: string): void {
    const accessToken = this.getAccessToken()
    if (accessToken === null) {
      this.snackbar.open('If you want to upload a SVG-File to your Dropbox account, you have to connect Egon before', undefined, {
        duration: SNACKBAR_DURATION_LONG,
        panelClass: SNACKBAR_INFO,
      });
      return;
    }
    this.dropbox = new Dropbox({ accessToken: accessToken });

    this.dropbox.filesUpload({ path: '/' + filename, contents: svgData })
      .then((response) => {
        this.uploadSvgSuccessful()
      })
      .catch((error) => {
        this.uploadNotSuccessful(error)
      });
  }

  getAccessToken(): string | null {
    const hash = window.location.hash;
    const queryString = hash.includes('#') ? hash.split('#')[1] : '';
    const urlSearchParams = new URLSearchParams(queryString);
    return urlSearchParams.get('access_token');
  }

  getUsersCurrentAccount(): void {
    this.dropbox = new Dropbox({
      clientId: environment.dropbox_api_key,
      fetch: fetch
    })
    if( this.dropbox !== null) {
      this.dropbox.usersGetCurrentAccount().then(function(response) {
        console.log(response);
      })
    .catch(function(error) {
        console.error(error);
      });
    }
  }

  private uploadSvgSuccessful(): void {
    this.snackbar.open('Upload successful', undefined, {
      duration: SNACKBAR_DURATION,
      panelClass: SNACKBAR_SUCCESS,
    });
  }

  private uploadNotSuccessful(errorMessage: string): void {
    this.snackbar.open(`Failed to upload file! Message: ${errorMessage}`, undefined, {
      duration: SNACKBAR_DURATION,
      panelClass: SNACKBAR_ERROR
    })
  }
}

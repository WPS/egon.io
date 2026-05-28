import { AfterViewInit, Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatDialogContent } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-external-link-generator-dialogue',
  imports: [AsyncPipe, MatFormField, MatInput, MatLabel, MatDialogContent],
  templateUrl: './external-link-generator-dialog.component.html',
  styleUrl: './external-link-generator-dialog.component.scss',
})
export class ExternalLinkGeneratorDialogComponent implements AfterViewInit {
  private baseUrl: string = '';
  private generatedLink = new BehaviorSubject<string>('');
  private generatedLinkShortend = new BehaviorSubject<string>('');
  targetUrl: string = '';
  startReplay: boolean = false;

  generatedLink$ = this.generatedLinkShortend.asObservable();

  ngAfterViewInit() {
    this.baseUrl = window.location.origin + window.location.pathname;
  }

  protected updateUrl($event: Event) {
    const target = $event.target as HTMLInputElement;
    this.targetUrl = target.value;
    this.generateUrl();
  }

  protected updateReplayMode($event: Event) {
    const target = $event.target as HTMLInputElement;
    this.startReplay = target.checked;
    this.generateUrl();
  }

  private generateUrl() {
    if (this.targetUrl.length > 0) {
      let generatedUrl = '';
      if (this.startReplay) {
        generatedUrl += '&replayStart=true';
      }
      generatedUrl +=
        this.baseUrl + '?storyUrl=' + encodeURI('' + this.targetUrl);

      this.generatedLink.next(generatedUrl);
      this.generatedLinkShortend.next(this.shortenLink(generatedUrl));
    } else {
      this.generatedLink.next('');
    }
  }

  protected copyLink() {
    navigator.clipboard.writeText(this.generatedLink.value);
  }

  private shortenLink(generatedUrl: string): string {
    if (generatedUrl.length > 150) {
      return generatedUrl.substring(0, 150) + '...';
    }
    return generatedUrl;
  }
}

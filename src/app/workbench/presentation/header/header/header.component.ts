import { Component } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { TitleService } from '../../../../tools/header/services/title.service';
import { ReplayService } from '../../../../tools/replay/services/replay.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  title$ = this.titleService.title$;
  description$ = this.titleService.description$;
  showDescription$ = this.titleService.showDescription$;

  isReplay$: Observable<boolean>;
  sentenceDescription$: Observable<string>;
  showDescription: Observable<boolean>;

  constructor(
    private titleService: TitleService,
    private replayService: ReplayService,
  ) {
    this.isReplay$ = this.replayService.replayOn$;

    this.sentenceDescription$ = combineLatest([
      this.replayService.currentSentence$,
      this.replayService.maxSentenceNumber$,
    ]).pipe(map(([sentence, count]) => `${sentence}/${count}`));

    this.showDescription = this.titleService.showDescription$;
  }

  openHeaderDialog(): void {
   this.titleService.openHeaderDialog()
  }

  setShowDescription(show: boolean): void {
    this.titleService.setShowDescription(show);
  }
}

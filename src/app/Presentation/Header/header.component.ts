import { Component } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { TitleService } from '../../Service/Title/title.service';
import { ReplayService } from '../../Service/Replay/replay.service';
import { ReplayStateService } from '../../Service/Replay/replay-state.service';
import { MatDialogConfig } from '@angular/material/dialog';
import { HeaderDialogComponent } from '../Dialog/header-dialog/header-dialog.component';
import { DialogService } from '../../Service/Dialog/dialog.service';

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
    private replayStateService: ReplayStateService,
    private dialogService: DialogService,
  ) {
    this.isReplay$ = this.replayStateService.replayOn$;

    this.sentenceDescription$ = combineLatest([
      this.replayService.currentSentence$,
      this.replayService.maxSentenceNumber$,
    ]).pipe(map(([sentence, count]) => `${sentence}/${count}`));

    this.showDescription = this.titleService.showDescription$;
  }

  openHeaderDialog(): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    this.dialogService.openDialog(HeaderDialogComponent, config);
  }

  setShowDescription(show: boolean): void {
    this.titleService.setShowDescription(show);
  }
}

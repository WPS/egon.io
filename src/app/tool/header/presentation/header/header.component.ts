import { Component } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { TitleService } from '../../service/title.service';
import { ReplayService } from '../../../replay/service/replay.service';
import { ReplayStateService } from '../../../replay/service/replay-state.service';
import { MatDialogConfig } from '@angular/material/dialog';
import { HeaderDialogComponent } from '../dialog/header-dialog/header-dialog.component';
import { DialogService } from '../../../../domain/service/dialog.service';

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

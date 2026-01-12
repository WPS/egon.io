import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { ReplayService } from '../../../../tools/replay/services/replay.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-buttons',
  templateUrl: './header-buttons.component.html',
  styleUrls: ['./header-buttons.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class HeaderButtonsComponent {
  private readonly replayService = inject(ReplayService);

  readonly sentenceDescription$: Observable<string>;

  constructor() {
    this.sentenceDescription$ = combineLatest([
      this.replayService.currentSentence$,
      this.replayService.maxSentenceNumber$,
    ]).pipe(map(([sentence, count]) => `${sentence}/${count}`));
  }

  @Input()
  hasDomainStory = false;
  @Input()
  hasTitle = false;
  @Input()
  isReplaying: boolean | null = false;
  @Input()
  isDirty: boolean | null = false;
  @Input()
  isReplayable = false;

  @Output()
  import = new EventEmitter<void>();
  @Output()
  openSettings = new EventEmitter<void>();
  @Output()
  startReplay = new EventEmitter<void>();
  @Output()
  stopReplay = new EventEmitter<void>();
  @Output()
  previousSentence = new EventEmitter<void>();
  @Output()
  nextSentence = new EventEmitter<void>();
  @Output()
  newStory = new EventEmitter<void>();
  @Output()
  showKeyboardShortCuts = new EventEmitter<void>();
  @Output()
  openLabelDictionary = new EventEmitter<void>();
  @Output()
  openDownloadDialog = new EventEmitter<void>();
  @Output()
  openImportFromUrlDialog = new EventEmitter<void>();
}

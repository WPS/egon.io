import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header-buttons',
  templateUrl: './header-buttons.component.html',
  styleUrls: ['./header-buttons.component.scss'],
})
export class HeaderButtonsComponent {
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
  openUploadUrlDialog = new EventEmitter<void>();
}

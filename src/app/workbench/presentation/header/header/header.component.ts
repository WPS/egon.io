import { Component } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { TitleService } from '../../../../tools/title/services/title.service';
import { ReplayService } from '../../../../tools/replay/services/replay.service';
import { ImportDomainStoryService } from '../../../../tools/import/services/import-domain-story.service';
import { SettingsService } from '../../../services/settings/settings.service';
import { RendererService } from '../../../../tools/modeler/services/renderer.service';
import { DirtyFlagService } from '../../../../domain/services/dirty-flag.service';
import { DialogService } from '../../../../domain/services/dialog.service';
import { ExportService } from '../../../../tools/export/services/export.service';
import { LabelDictionaryService } from '../../../../tools/label-dictionary/services/label-dictionary.service';

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
  isDirty$: Observable<boolean>;
  sentenceDescription$: Observable<string>;
  showDescription: Observable<boolean>;

  constructor(
    private titleService: TitleService,
    private replayService: ReplayService,
    private importService: ImportDomainStoryService,
    private settingsService: SettingsService,
    private renderService: RendererService,
    private dirtyFlagService: DirtyFlagService,
    private dialogService: DialogService,
    private exportService: ExportService,
    private labelDictionaryService: LabelDictionaryService,
  ) {
    this.isReplay$ = this.replayService.replayOn$;
    this.isDirty$ = this.dirtyFlagService.dirty$;

    this.sentenceDescription$ = combineLatest([
      this.replayService.currentSentence$,
      this.replayService.maxSentenceNumber$,
    ]).pipe(map(([sentence, count]) => `${sentence}/${count}`));

    this.showDescription = this.titleService.showDescription$;
  }

  openHeaderDialog(): void {
    this.titleService.openHeaderDialog();
  }

  openSettings(): void {
    this.settingsService.open();
  }

  setShowDescription(show: boolean): void {
    this.titleService.setShowDescription(show);
  }

  createNewDomainStory(): void {
    this.titleService.reset();
    this.renderService.reset();
  }

  onImport(): void {
    this.importService.performImport();
  }

  startReplay(): void {
    this.replayService.startReplay(true);
  }

  stopReplay(): void {
    this.replayService.stopReplay();
  }

  previousSentence(): void {
    this.replayService.previousSentence();
  }

  nextSentence(): void {
    this.replayService.nextSentence();
  }

  openKeyboardShortcutsDialog(): void {
    this.dialogService.openKeyboardShortcutsDialog();
  }

  openLabelDictionary(): void {
    this.labelDictionaryService.openLabelDictionary();
  }

  openDownloadDialog(): void {
    this.exportService.openDownloadDialog();
  }

  openImportFromUrlDialog(): void {
    this.importService.openImportFromUrlDialog();
  }

  get hasDomainStory() {
    return this.exportService.isDomainStoryExportable();
  }

  get hasTitle(): boolean {
    return this.titleService.hasTitleOrDescription();
  }

  get isReplayable() {
    return this.replayService.isReplayable();
  }
}

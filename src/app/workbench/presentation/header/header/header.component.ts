import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TitleService } from '../../../../tools/title/services/title.service';
import { ReplayService } from '../../../../tools/replay/services/replay.service';
import { ImportDomainStoryService } from '../../../../tools/import/services/import-domain-story.service';
import { SettingsService } from '../../../services/settings/settings.service';
import { DirtyFlagService } from '../../../../domain/services/dirty-flag.service';
import { DialogService } from '../../../../domain/services/dialog.service';
import { ExportService } from '../../../../tools/export/services/export.service';
import { LabelDictionaryService } from '../../../../tools/label-dictionary/services/label-dictionary.service';
import { ModelerService } from 'src/app/tools/modeler/services/modeler.service';

import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { HeaderButtonsComponent } from '../header-buttons/header-buttons.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    HeaderButtonsComponent,
  ],
})
export class HeaderComponent {
  private readonly titleService = inject(TitleService);
  private readonly replayService = inject(ReplayService);
  private readonly importService = inject(ImportDomainStoryService);
  private readonly settingsService = inject(SettingsService);
  private readonly modelerService = inject(ModelerService);
  private readonly dirtyFlagService = inject(DirtyFlagService);
  private readonly dialogService = inject(DialogService);
  private readonly exportService = inject(ExportService);
  private readonly labelDictionaryService = inject(LabelDictionaryService);

  readonly title$ = this.titleService.title$;
  readonly description$ = this.titleService.description$;
  readonly showDescription$ = this.titleService.showDescription$;

  readonly isReplay$: Observable<boolean>;
  readonly isDirty$: Observable<boolean>;

  readonly showDescription: Observable<boolean>;

  constructor() {
    this.isReplay$ = this.replayService.replayOn$;
    this.isDirty$ = this.dirtyFlagService.dirty$;

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
    if (this.dirtyFlagService.dirty) {
      this.importService.openUnsavedChangesReminderDialog(() => {
        this.titleService.reset();
        this.modelerService.reset();
      });
    } else {
      this.titleService.reset();
      this.modelerService.reset();
    }
  }

  onImport(): void {
    if (this.dirtyFlagService.dirty) {
      this.importService.openUnsavedChangesReminderDialog(() =>
        this.importService.performImport(),
      );
    } else {
      this.importService.performImport();
    }
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
    this.importService.openImportFromUrlDialog(this.dirtyFlagService.dirty);
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

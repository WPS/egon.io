import { Component, inject, Signal } from '@angular/core';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { ReplayService } from '../../../../tools/replay/services/replay.service';
import { ImportDomainStoryService } from '../../../../tools/import/services/import-domain-story.service';
import { SettingsService } from '../../../services/settings/settings.service';
import { DirtyFlagService } from 'src/app/tools/modeler/services/dirty-flag.service';
import { DialogService } from 'src/app/tools/dialog/services/dialog.service';
import { ExportService } from '../../../../tools/export/services/export.service';
import { LabelDictionaryService } from '../../../../tools/label-dictionary/services/label-dictionary.service';
import { ModelerService } from 'src/app/tools/modeler/services/modeler.service';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { HeaderButtonsComponent } from '../header-buttons/header-buttons.component';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],

  imports: [MatToolbarModule, MatCardModule, HeaderButtonsComponent],
})
export class HeaderComponent {
  readonly propertiesService = inject(PropertiesService);
  private readonly replayService = inject(ReplayService);
  private readonly importService = inject(ImportDomainStoryService);
  private readonly settingsService = inject(SettingsService);
  private readonly modelerService = inject(ModelerService);
  private readonly dirtyFlagService = inject(DirtyFlagService);
  private readonly dialogService = inject(DialogService);
  private readonly exportService = inject(ExportService);
  private readonly labelDictionaryService = inject(LabelDictionaryService);
  private readonly elementRegistryService = inject(ElementRegistryService);

  readonly description = this.propertiesService.description;
  readonly showDescription = this.propertiesService.showDescription;

  readonly isReplayOn: Signal<boolean> = this.replayService.replayOn;
  readonly showGroups: Signal<boolean> = this.replayService.showGroups;
  readonly hasGroups: Signal<boolean> = this.replayService.hasGroups;
  readonly isDirty: Signal<boolean> = this.dirtyFlagService.dirty;

  openHeaderDialog(): void {
    this.propertiesService.openHeaderDialog();
  }

  openSettings(): void {
    this.settingsService.open();
  }

  setShowDescription(show: boolean): void {
    this.propertiesService.setShowDescription(show);
  }

  createNewDomainStory(): void {
    if (this.dirtyFlagService.dirty()) {
      this.importService.openUnsavedChangesReminderDialog(() => {
        this.propertiesService.reset();
        this.modelerService.reset();
      });
    } else {
      this.propertiesService.reset();
      this.modelerService.reset();
    }
  }

  onImport(): void {
    if (this.dirtyFlagService.dirty()) {
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

  toggleGroups(): void {
    this.replayService.toggleShowGroups();
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
    this.importService.openImportFromUrlDialog(this.dirtyFlagService.dirty());
  }

  get hasDomainStory() {
    return this.exportService.isDomainStoryExportable();
  }

  get hasTitle(): boolean {
    return this.propertiesService.hasTitleOrDescription();
  }

  get isReplayable() {
    return this.replayService.isReplayable();
  }
}

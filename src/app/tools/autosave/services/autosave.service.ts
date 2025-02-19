import { Injectable } from '@angular/core';
import { ModelerService } from '../../modeler/services/modeler.service';
import { ExportService } from '../../export/services/export.service';
import { Draft } from '../domain/draft';
import { AutosaveConfigurationService } from './autosave-configuration.service';
import { StorageService } from '../../../domain/services/storage.service';
import { TitleService } from '../../title/services/title.service';
import { AutosaveConfiguration } from '../domain/autosave-configuration';
import { Subject } from 'rxjs';
import {
  DRAFTS_KEY,
  INITIAL_DESCRIPTION,
  INITIAL_TITLE,
  SNACKBAR_DURATION,
  SNACKBAR_INFO,
} from '../../../domain/entities/constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IconSetImportExportService } from '../../icon-set-config/services/icon-set-import-export.service';

@Injectable({
  providedIn: 'root',
})
export class AutosaveService {
  private autosaveTimer: any;
  autosavedDraftsChanged$ = new Subject<void>();

  constructor(
    private autosaveConfiguration: AutosaveConfigurationService,
    private exportService: ExportService,
    private modelerService: ModelerService,
    private snackbar: MatSnackBar,
    private storageService: StorageService,
    private titleService: TitleService,
    private iconSetImportExportService: IconSetImportExportService,
  ) {
    this.autosaveConfiguration.configuration$.subscribe((configuration) =>
      this.updateConfiguration(configuration),
    );
  }

  getDrafts(): Draft[] {
    const drafts = this.readDrafts();
    this.sortDrafts(drafts);
    return drafts;
  }

  loadDraft(draft: Draft): void {
    const configFromFile = draft.configAndDST.domain;
    const config =
      this.iconSetImportExportService.createIconSetConfiguration(
        configFromFile,
      );
    const story = JSON.parse(draft.configAndDST.dst);

    this.titleService.updateTitleAndDescription(
      draft.title,
      draft.description,
      false,
    );

    this.modelerService.importStory(story, config);
  }

  removeAllDrafts() {
    this.storageService.set(DRAFTS_KEY, []);
    this.autosavedDraftsChanged$.next();
  }

  loadLatestDraft() {
    const drafts = this.readDrafts();
    if (drafts.length === 0) {
      return;
    }
    this.loadDraft(drafts[0]);
  }

  private updateConfiguration(configuration: AutosaveConfiguration) {
    this.stopTimer();

    if (configuration.activated) {
      this.startTimer(configuration.interval, configuration.maxDrafts);
    }
  }

  private stopTimer(): void {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = undefined;
    }
  }

  private startTimer(interval: number, maxDrafts: number): void {
    this.autosaveTimer = setInterval(() => {
      const savedDrafts = this.getDrafts();
      const newDraft = this.createDraft();
      let isChanged = maxDrafts > 0;
      if (savedDrafts.length > 0) {
        isChanged = isChanged && !this.isSame(newDraft, savedDrafts[0]);
      }
      if (isChanged && !this.isDraftEmpty(newDraft)) {
        savedDrafts.unshift(newDraft);
        while (savedDrafts.length > maxDrafts) {
          savedDrafts.pop();
        }
        this.writeDrafts(savedDrafts);
        this.snackbar.open('Draft Saved', undefined, {
          panelClass: SNACKBAR_INFO,
          duration: SNACKBAR_DURATION,
        });
        this.autosavedDraftsChanged$.next();
      }
    }, interval * 1000);
  }

  private isDraftEmpty(draft: Draft) {
    const configAndDST = draft.configAndDST ?? { dst: '[]' };
    return (
      draft.title === INITIAL_TITLE &&
      draft.description === INITIAL_DESCRIPTION &&
      JSON.parse(configAndDST.dst).length === 0
    );
  }

  private isSame(a: Draft, b: Draft) {
    return (
      a.title === b.title &&
      a.description === b.description &&
      JSON.stringify(a.configAndDST) === JSON.stringify(b.configAndDST)
    );
  }

  private writeDrafts(drafts: Draft[]) {
    this.storageService.set(DRAFTS_KEY, drafts);
  }

  private readDrafts(): Draft[] {
    return this.storageService.get(DRAFTS_KEY) ?? [];
  }

  private createDraft(): Draft {
    const dst = JSON.stringify(this.modelerService.getStory(), null, 2);
    const configAndDST = this.exportService.createConfigAndDST(dst);

    const date = new Date().toString().slice(0, 25);

    return {
      title: this.titleService.getTitle(),
      description: this.titleService.getDescription(),
      configAndDST,
      date,
    };
  }

  private sortDrafts(drafts: Draft[]): void {
    drafts.sort((a: Draft, b: Draft) => {
      const aDate = Date.parse(a.date);
      const bDate = Date.parse(b.date);
      return aDate > bDate ? 0 : 1;
    });
  }
}

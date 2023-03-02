import { Injectable } from '@angular/core';
import { RendererService } from '../Renderer/renderer.service';
import { ExportService } from '../Export/export.service';
import { Draft } from '../../Domain/Autosave/draft';
import { AutosaveConfigurationService } from './autosave-configuration.service';
import { IconDictionaryService } from '../DomainConfiguration/icon-dictionary.service';
import { elementTypes } from '../../Domain/Common/elementTypes';
import { fromConfigurationFromFile } from '../../Domain/Common/domainConfiguration';
import { StorageService } from '../BrowserStorage/storage.service';
import { TitleService } from '../Title/title.service';
import { AutosaveConfiguration } from '../../Domain/Autosave/autosave-configuration';
import { SNACKBAR_DURATION, SNACKBAR_INFO } from 'src/app/Domain/Common/constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

export const DRAFTS_TAG = 'autosaveDrafts';

@Injectable({
  providedIn: 'root',
})
export class AutosaveService {
  private autosaveTimer: any;
  autosavedDraftsChanged$ = new Subject<void>();

  constructor(
    private autosaveConfiguration: AutosaveConfigurationService,
    private exportService: ExportService,
    private iconDistionaryService: IconDictionaryService,
    private rendererService: RendererService,
    private snackbar: MatSnackBar,
    private storageService: StorageService,
    private titleService: TitleService,
  ) {
    this.autosaveConfiguration.configuration$.subscribe((configuration) =>
      this.updateConfiguration(configuration)
    );
  }

  loadCurrentDrafts(): Draft[] {
    const drafts = this.readDrafts();
    this.sortDrafts(drafts);
    return drafts;
  }

  loadDraft(draft: Draft): void {
    const configFromFile = draft.configAndDST.domain;
    const config = fromConfigurationFromFile(configFromFile);
    const story = JSON.parse(draft.configAndDST.dst);

    this.titleService.updateTitleAndDescription(
      draft.title,
      draft.description,
      false
    );

    const actorIcons = this.iconDistionaryService.getElementsOfType(
      story,
      elementTypes.ACTOR
    );
    const workObjectIcons = this.iconDistionaryService.getElementsOfType(
      story,
      elementTypes.WORKOBJECT
    );
    this.iconDistionaryService.updateIconRegistries(
      actorIcons,
      workObjectIcons,
      config
    );
    this.rendererService.importStory(story, true, config, false);
  }

  removeAllDrafts() {
    this.storageService.set(DRAFTS_TAG, []);
    this.autosavedDraftsChanged$.next();
  }

  private updateConfiguration(configuration: AutosaveConfiguration) {
    this.stopTimer();

    if (configuration.activated) {
      this.startTimer(configuration.interval, configuration.amount);
    }
  }

  private stopTimer(): void {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = undefined;
    }
  }

  private startTimer(interval: number, amount: number): void {
    this.autosaveTimer = setInterval(() => {
      const drafts = this.loadCurrentDrafts();
      const newDraft = this.createDraft();
      let isChanged = amount > 0;
      if (drafts.length > 0) {
        isChanged = isChanged && !this.isSame(newDraft, drafts[0]);
      }
      if (isChanged) {
        drafts.unshift(this.createDraft());
        while (drafts.length > amount) {
          drafts.pop();
        }
        this.writeDrafts(drafts);
        this.snackbar.open('Draft Saved', undefined, { panelClass: SNACKBAR_INFO, duration: SNACKBAR_DURATION });
        this.autosavedDraftsChanged$.next();
      }
    }, interval * 60000);
  }

  private isSame(a: Draft, b: Draft) {
    return a.title === b.title
      && a.description === b.description
      && JSON.stringify(a.configAndDST) === JSON.stringify(b.configAndDST);
  }

  private writeDrafts(drafts: Draft[]) {
    this.storageService.set(DRAFTS_TAG, drafts);
  }

  private readDrafts(): Draft[] {
    return this.storageService.get(DRAFTS_TAG) ?? [];
  }

  private createDraft(): Draft {
    const dst = JSON.stringify(this.rendererService.getStory(), null, 2);
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

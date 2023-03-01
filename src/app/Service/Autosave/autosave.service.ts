import { Injectable } from '@angular/core';
import { RendererService } from '../Renderer/renderer.service';
import { ExportService } from '../Export/export.service';
import { Autosave } from '../../Domain/Autosave/autosave';
import { AutosaveStateService } from './autosave-state.service';
import { IconDictionaryService } from '../DomainConfiguration/icon-dictionary.service';
import { elementTypes } from '../../Domain/Common/elementTypes';
import { fromConfigurationFromFile } from '../../Domain/Common/domainConfiguration';
import { StorageService } from '../BrowserStorage/storage.service';
import { TitleService } from '../Title/title.service';
import { AutosaveState } from './autosave-state';
import { AUTOSAVE_TAG, SNACKBAR_DURATION, SNACKBAR_INFO } from 'src/app/Domain/Common/constants';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AutosaveService {
  private autosaveTimer: any;

  constructor(
    private rendererService: RendererService,
    private exportService: ExportService,
    private autosaveStateService: AutosaveStateService,
    private iconDistionaryService: IconDictionaryService,
    private storageService: StorageService,
    private titleService: TitleService,
    private snackbar: MatSnackBar
  ) {
    this.autosaveStateService.state$.subscribe(
      state => this.updateState(state)
    );
  }

  loadCurrentAutosaves(): Autosave[] {
    const autosaves = this.readAutosaves();
    this.sortAutosaves(autosaves);
    return autosaves;
  }

  loadAutosave(autosave: Autosave): void {
    const configFromFile = autosave.configAndDST.domain;
    const config = fromConfigurationFromFile(configFromFile);
    const story = JSON.parse(autosave.configAndDST.dst);

    this.titleService.updateTitleAndDescription(
      autosave.title,
      autosave.description,
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

  private updateState(state: AutosaveState) {
    this.stopTimer();

    if (state.activated) {
      this.startTimer(state.interval, state.amount);
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
      const currentAutosaves = this.loadCurrentAutosaves();
      const newAutosave = this.createAutosave();
      let isChanged = amount > 0;
      if (currentAutosaves.length > 0) {
        isChanged = isChanged && !this.isSame(newAutosave, currentAutosaves[0]);
      }
      if (isChanged) {
        currentAutosaves.unshift(this.createAutosave());
        while (currentAutosaves.length > amount) {
          currentAutosaves.pop();
        }
        this.writeAutosaves(currentAutosaves);
        this.snackbar.open('Draft Saved', undefined, { panelClass: SNACKBAR_INFO, duration: SNACKBAR_DURATION });
      }
    }, interval * 60000);
  }

  private isSame(a: Autosave, b: Autosave) {
    return a.title === b.title && a.description === b.description && JSON.stringify(a.configAndDST) === JSON.stringify(b.configAndDST);
  }

  private writeAutosaves(autosaves: Autosave[]) {
    this.storageService.set(AUTOSAVE_TAG, autosaves);
  }

  private readAutosaves(): Autosave[] {
    return this.storageService.get(AUTOSAVE_TAG) ?? [];
  }

  private createAutosave(): Autosave {
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

  private sortAutosaves(autosaves: Autosave[]): void {
    autosaves.sort((a: Autosave, b: Autosave) => {
      const aDate = Date.parse(a.date);
      const bDate = Date.parse(b.date);

      if (aDate > bDate) {
        return 0;
      }
      return 1;
    });
  }
}

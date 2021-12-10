import { Injectable } from '@angular/core';
import { RendererService } from '../Renderer/renderer.service';
import { DomainConfigurationService } from '../DomainConfiguration/domain-configuration.service';
import { ExportService } from '../Export/export.service';
import { Autosave } from '../../Domain/Autosave/autosave';
import { Autosaves } from '../../Domain/Autosave/autosaves';
import { AutosaveStateService } from './autosave-state.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { IconDictionaryService } from '../DomainConfiguration/icon-dictionary.service';
import { elementTypes } from '../../Domain/Common/elementTypes';
import {
  AUTOSAVE_AMOUNT_TAG,
  AUTOSAVE_INTERVAL_TAG,
  AUTOSAVE_TAG,
  MAX_AUTOSAVES,
} from '../../Domain/Common/constants';
import { fromConfiguratioFromFile } from '../../Domain/Common/domainConfiguration';
import { StorageService } from '../BrowserStorage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AutosaveService {
  private readonly autosaveEnabled: Observable<boolean>;
  private autosaveTimer: any;
  private autosaveInterval = new BehaviorSubject(5); // in min
  private maxAutosaves: number;

  constructor(
    private rendererService: RendererService,
    private domainConfigurationService: DomainConfigurationService,
    private exportService: ExportService,
    private autosaveStateService: AutosaveStateService,
    private iconDistionaryService: IconDictionaryService,
    private storageService: StorageService
  ) {
    this.maxAutosaves = storageService.getMaxAUtosaves();
    this.autosaveEnabled =
      this.autosaveStateService.getAutosaveStateAsObservable();
    this.loadAutosaveInterval();
    if (this.autosaveStateService.getAutosaveState()) {
      this.startTimer();
    }
  }

  public loadAutosave(autosave: Autosave): void {
    const configFromFile = JSON.parse(autosave.configAndDST.domain);
    const config = fromConfiguratioFromFile(configFromFile);
    const story = JSON.parse(autosave.configAndDST.dst);

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

  public changeAutosaveInterval(interval: number): void {
    this.autosaveInterval.next(interval);
    this.saveAutosaveInterval();
    if (this.autosaveEnabled) {
      this.stopTimer();
      this.startTimer();
    }
  }

  public startAutosaving(): void {
    this.autosaveStateService.setAutosaveState(true);
    this.startTimer();
  }

  public stopAutosaving(): void {
    this.autosaveStateService.setAutosaveState(false);
    this.stopTimer();
  }

  public getAutosaveInterval(): number {
    return this.autosaveInterval.value;
  }

  public getAutosaveEnabledAsObservable(): Observable<boolean> {
    return this.autosaveEnabled;
  }

  private createAutosave(): Autosave {
    const dst = JSON.stringify(this.rendererService.getStory());
    const configAndDST = this.exportService.createConfigAndDST(dst);

    const date = new Date().toString().slice(0, 25);

    return {
      configAndDST,
      date,
    };
  }

  public setMaxAutosaves(amount: number) {
    this.maxAutosaves = amount;
    this.storageService.setMaxAutosaves(amount);
  }

  public getMaxAutosaves(): number {
    return this.maxAutosaves;
  }

  private stopTimer(): void {
    clearInterval(this.autosaveTimer);
  }

  private startTimer(): void {
    // @ts-ignore
    this.autosaveTimer = new setInterval(() => {
      const currentAutosaves = this.loadCurrentAutosaves();
      if (currentAutosaves.length > this.maxAutosaves) {
        currentAutosaves.pop();
      }
      currentAutosaves.unshift(this.createAutosave());
      this.storageService.setAutosaves(currentAutosaves);
    }, this.autosaveInterval.getValue() * 60000);
  }
  public loadCurrentAutosaves(): Autosave[] {
    const autosaves = this.storageService.getAutosaves();
    this.sortAutosaves(autosaves);
    return autosaves;
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

  private loadAutosaveInterval(): void {
    const autosaveIntervalString = this.storageService.getAutosaveInterval();
    if (autosaveIntervalString) {
      this.autosaveInterval.next(JSON.parse(autosaveIntervalString));
    }
  }

  private saveAutosaveInterval(): void {
    this.storageService.setAutosaveInterval(this.autosaveInterval.value);
  }
}

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

@Injectable({
  providedIn: 'root',
})
export class AutosaveService {
  private readonly autosaveEnabled: Observable<boolean>;
  private autosaveTimer: any;
  private autosaveInterval = new BehaviorSubject(5); // in min
  private maxAutosaves = Number(
    localStorage.getItem(AUTOSAVE_AMOUNT_TAG) || MAX_AUTOSAVES
  );

  constructor(
    private rendererService: RendererService,
    private domainConfigurationService: DomainConfigurationService,
    private exportService: ExportService,
    private autosaveStateService: AutosaveStateService,
    private iconDistionaryService: IconDictionaryService
  ) {
    this.autosaveEnabled =
      this.autosaveStateService.getAutosaveStateAsObservable();
    this.loadAutosaveInterval();
    if (this.autosaveStateService.getAutosaveState()) {
      this.startTimer();
    }
  }

  public loadAutosave(autosave: Autosave): void {
    const config = JSON.parse(autosave.configAndDST.domain);
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
    localStorage.setItem(AUTOSAVE_AMOUNT_TAG, '' + amount);
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
      localStorage.setItem(
        AUTOSAVE_TAG,
        JSON.stringify({ autosaves: currentAutosaves })
      );
    }, this.autosaveInterval.getValue() * 60000);
  }
  public loadCurrentAutosaves(): Autosave[] {
    const autosavesString = localStorage.getItem(AUTOSAVE_TAG);
    if (autosavesString) {
      const autosaves = (JSON.parse(autosavesString) as Autosaves).autosaves;
      if (autosaves && autosaves.length > 0) {
        this.sortAutosaves(autosaves);
        return autosaves;
      }
    }
    return [];
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
    const autosaveIntervalString = localStorage.getItem(AUTOSAVE_INTERVAL_TAG);
    if (autosaveIntervalString) {
      this.autosaveInterval.next(JSON.parse(autosaveIntervalString));
    }
  }

  private saveAutosaveInterval(): void {
    localStorage.setItem(
      AUTOSAVE_INTERVAL_TAG,
      '' + this.autosaveInterval.getValue()
    );
  }
}

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

const autosaveIntervalTag = 'autosaveIntervalTag';
const autosaveTag = 'autosaveTag';
const maxAutosaves = 5;

@Injectable({
  providedIn: 'root',
})
export class AutosaveService {
  private autosaveEnabled: Observable<boolean>;
  private autosaveTimer: any;
  private autosaveInterval = new BehaviorSubject(5); // in min

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

  public applyAutosave(autosave: Autosave): void {
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

  public getAutosaveIntervalAsObservable(): Observable<number> {
    return this.autosaveInterval.asObservable();
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

  private stopTimer(): void {
    clearInterval(this.autosaveTimer);
  }

  private startTimer(): void {
    // @ts-ignore
    this.autosaveTimer = new setInterval(() => {
      const currentAutosaves = this.loadCurrentAutosaves();
      if (currentAutosaves.length > maxAutosaves) {
        currentAutosaves.pop();
      }
      currentAutosaves.unshift(this.createAutosave());
      this.saveAutosaves(currentAutosaves);
    }, this.autosaveInterval.getValue() * 60000);
  }

  private saveAutosaves(autosaves: Autosave[]): void {
    localStorage.setItem(autosaveTag, JSON.stringify({ autosaves }));
  }

  public loadCurrentAutosaves(): Autosave[] {
    const autosavesString = localStorage.getItem(autosaveTag);
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
    const autosaveIntervalString = localStorage.getItem(autosaveIntervalTag);
    if (autosaveIntervalString) {
      this.autosaveInterval.next(JSON.parse(autosaveIntervalString));
    }
  }

  private saveAutosaveInterval(): void {
    localStorage.setItem(
      autosaveIntervalTag,
      '' + this.autosaveInterval.getValue()
    );
  }
}

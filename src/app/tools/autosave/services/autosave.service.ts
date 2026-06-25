import {
  effect,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ModelerService } from '../../modeler/services/modeler.service';
import { ExportService } from '../../export/services/export.service';
import { Draft } from '../domain/draft';
import { AutosaveConfigurationService } from './autosave-configuration.service';
import { StorageService } from '../../../utils/services/storage.service';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
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
import { DomainStory } from 'src/app/domain/entities/domain-story';
import { environment } from '../../../../environments/environment';
import {
  FileConfiguration,
  IconSetImportExportService,
} from '../../icon-set-config/services/icon-set-import-export.service';
import { IconSet } from 'src/app/domain/entities/icon-set';
import { isPresent } from 'src/app/utils/isPresent';
import { BusinessObject } from 'src/app/domain/entities/business-object';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class AutosaveService {
  private autosaveTimer: NodeJS.Timeout | undefined;

  private readonly autosavedDraftsChangedEmitterSubject = new Subject<void>();
  readonly autosavedDraftsChanged$ =
    this.autosavedDraftsChangedEmitterSubject.asObservable();
  private readonly importConfigChangedSignal: WritableSignal<
    IconSet | undefined
  > = signal(undefined);
  readonly importConfigChanged: Signal<IconSet | undefined> =
    this.importConfigChangedSignal.asReadonly();

  private readonly autosaveConfiguration = inject(AutosaveConfigurationService);
  private readonly exportService = inject(ExportService);
  private readonly modelerService = inject(ModelerService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly storageService = inject(StorageService);
  private readonly propertiesService = inject(PropertiesService);
  private readonly iconSetImportExportService = inject(
    IconSetImportExportService,
  );

  constructor() {
    effect(() => {
      this.updateConfiguration(this.autosaveConfiguration.configuration());
    });
    this.iconSetImportExportService.iconSetChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.autosave(
          this.autosaveConfiguration.configuration().maxDrafts,
          false,
        );
      });
  }

  getDrafts(): Draft[] {
    const drafts = this.readDrafts();
    this.sortDrafts(drafts);
    return drafts;
  }

  // if we fitToScreen while the Autosave-Dialoge is open, the canvas is not on screen and the Zoom breaks
  loadDraft(draft: Draft, fitToScreen = false): void {
    const iconSet = this.iconSetImportExportService.createIconSetConfiguration(
      this.getIconSetFromAutosave(draft),
    );
    const businessObjects = this.getBusinessObjectsFromDraft(draft);

    this.propertiesService.updateTitleAndDescriptionAndScope(
      draft.title,
      draft.description,
      draft.scope,
      false,
    );

    this.importConfigChangedSignal.set(iconSet);
    this.modelerService.importStory(businessObjects, iconSet, fitToScreen);
  }

  removeAllDrafts() {
    this.storageService.set(DRAFTS_KEY, []);
    this.autosavedDraftsChangedEmitterSubject.next();
  }

  loadLatestDraft() {
    const drafts = this.readDrafts();
    if (drafts.length === 0) {
      return;
    }
    this.loadDraft(drafts[0], true);
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

  private startTimer(intervalInMs: number, maxDrafts: number): void {
    this.autosaveTimer = setInterval(
      () => this.autosave(maxDrafts, true),
      intervalInMs * 1000,
    );
  }

  // non-private for testing purposes
  autosave(maxDrafts: number, showAutosaveMessage: boolean) {
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
      if (showAutosaveMessage) {
        this.snackbar.open('Draft Saved', undefined, {
          panelClass: SNACKBAR_INFO,
          duration: SNACKBAR_DURATION,
        });
      }
      this.autosavedDraftsChangedEmitterSubject.next();
    }
  }

  private isDraftEmpty(draft: Draft) {
    const configAndDST = draft.configAndDST ?? {
      iconSet: '',
      domainStory: { businessObjects: [], description: '', version: '' },
    };
    return (
      draft.title === INITIAL_TITLE &&
      draft.description === INITIAL_DESCRIPTION &&
      configAndDST.domainStory.businessObjects.length === 0
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
    const domainStory: DomainStory = {
      businessObjects: this.modelerService.getStory(),
      version: environment.version,
      description: this.propertiesService.getDescription(),
      title: this.propertiesService.getTitle(),
      scope: this.propertiesService.getScope(),
    };

    const configAndDST = this.exportService.createConfigAndDST(domainStory);

    const date = new Date().toString().slice(0, 25);

    return {
      title: this.propertiesService.getTitle(),
      description: this.propertiesService.getDescription(),
      scope: this.propertiesService.getScope(),
      configAndDST,
      date,
    };
  }

  private sortDrafts(drafts: Draft[]): void {
    drafts.sort((a: Draft, b: Draft) => {
      const aDate = Date.parse(a.date);
      const bDate = Date.parse(b.date);
      return aDate === bDate ? 0 : aDate > bDate ? -1 : 1;
    });
  }

  // Legacy Compatability - to be removed in version v5.0.0
  //@ts-ignore
  private getIconSetFromAutosave(draft: Draft): FileConfiguration {
    return isPresent(draft.configAndDST.iconSet)
      ? //@ts-ignore
        draft.configAndDST.iconSet
      : //@ts-ignore
        draft.configAndDST.domain;
  }

  //@ts-ignore
  private getBusinessObjectsFromDraft(draft: Draft): BusinessObject[] {
    return isPresent(draft.configAndDST.domainStory)
      ? //@ts-ignore
        draft.configAndDST.domainStory.businessObjects
      : //@ts-ignore
        JSON.parse(draft.configAndDST.dst);
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockProvider, MockService } from 'ng-mocks';
import { signal } from '@angular/core';

import { HeaderComponent } from './header.component';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { ReplayService } from '../../../../tools/replay/services/replay.service';
import { ImportDomainStoryService } from '../../../../tools/import/services/import-domain-story.service';
import { ExportService } from '../../../../tools/export/services/export.service';
import { ModelerService } from '../../../../tools/modeler/services/modeler.service';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { SettingsService } from '../../../services/settings/settings.service';
import { DirtyFlagService } from 'src/app/tools/modeler/services/dirty-flag.service';
import { DialogService } from 'src/app/tools/dialog/services/dialog.service';
import { LabelDictionaryService } from '../../../../tools/label-dictionary/services/label-dictionary.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const dirtySignal = signal(false);

  let propertiesService: PropertiesService;
  let replayServiceSpy: jest.Mocked<ReplayService>;
  let importServiceSpy: jest.Mocked<ImportDomainStoryService>;
  let exportServiceSpy: jest.Mocked<ExportService>;
  let modelerServiceSpy: jest.Mocked<ModelerService>;
  let settingsServiceSpy: jest.Mocked<SettingsService>;
  let dialogServiceSpy: jest.Mocked<DialogService>;
  let labelDictionaryServiceSpy: jest.Mocked<LabelDictionaryService>;

  beforeEach(async () => {
    dirtySignal.set(false);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: PropertiesService },
        MockProvider(ReplayService, {
          replayOn: signal(false),
          currentSentence: signal(1),
          maxSentenceNumber: signal(2),
          showGroups: signal(false),
          hasGroups: signal(false),
        }),
        MockProvider(DirtyFlagService, { dirty: dirtySignal }),
        {
          provide: ImportDomainStoryService,
          useValue: MockService(ImportDomainStoryService),
        },
        { provide: ExportService, useValue: MockService(ExportService) },
        { provide: ModelerService, useValue: MockService(ModelerService) },
        {
          provide: ElementRegistryService,
          useValue: MockService(ElementRegistryService),
        },
        { provide: SettingsService, useValue: MockService(SettingsService) },
        { provide: DialogService, useValue: MockService(DialogService) },
        {
          provide: LabelDictionaryService,
          useValue: MockService(LabelDictionaryService),
        },
      ],
    }).compileComponents();

    propertiesService = TestBed.inject(PropertiesService);
    replayServiceSpy = TestBed.inject(
      ReplayService,
    ) as jest.Mocked<ReplayService>;
    importServiceSpy = TestBed.inject(
      ImportDomainStoryService,
    ) as jest.Mocked<ImportDomainStoryService>;
    exportServiceSpy = TestBed.inject(
      ExportService,
    ) as jest.Mocked<ExportService>;
    modelerServiceSpy = TestBed.inject(
      ModelerService,
    ) as jest.Mocked<ModelerService>;
    settingsServiceSpy = TestBed.inject(
      SettingsService,
    ) as jest.Mocked<SettingsService>;
    dialogServiceSpy = TestBed.inject(
      DialogService,
    ) as jest.Mocked<DialogService>;
    labelDictionaryServiceSpy = TestBed.inject(
      LabelDictionaryService,
    ) as jest.Mocked<LabelDictionaryService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openSettings should open the settings', () => {
    component.openSettings();
    expect(settingsServiceSpy.open).toHaveBeenCalled();
  });

  describe('createNewDomainStory', () => {
    it('should reset directly when not dirty', () => {
      dirtySignal.set(false);
      const resetSpy = jest.spyOn(propertiesService, 'reset');

      component.createNewDomainStory();

      expect(resetSpy).toHaveBeenCalled();
      expect(modelerServiceSpy.reset).toHaveBeenCalled();
    });

    it('should ask for confirmation when dirty and reset via the callback', () => {
      dirtySignal.set(true);
      const resetSpy = jest.spyOn(propertiesService, 'reset');

      component.createNewDomainStory();

      expect(
        importServiceSpy.openUnsavedChangesReminderDialog,
      ).toHaveBeenCalled();
      const callback =
        importServiceSpy.openUnsavedChangesReminderDialog.mock.calls[0][0];
      callback();
      expect(resetSpy).toHaveBeenCalled();
      expect(modelerServiceSpy.reset).toHaveBeenCalled();
    });
  });

  describe('onImport', () => {
    it('should import directly when not dirty', () => {
      dirtySignal.set(false);

      component.onImport();

      expect(importServiceSpy.performImport).toHaveBeenCalled();
    });

    it('should ask for confirmation when dirty and import via the callback', () => {
      dirtySignal.set(true);

      component.onImport();

      const callback =
        importServiceSpy.openUnsavedChangesReminderDialog.mock.calls[0][0];
      callback();
      expect(importServiceSpy.performImport).toHaveBeenCalled();
    });
  });

  it('startReplay should start a checked replay', () => {
    component.startReplay();
    expect(replayServiceSpy.startReplay).toHaveBeenCalledWith(true);
  });

  it('stopReplay should stop the replay', () => {
    component.stopReplay();
    expect(replayServiceSpy.stopReplay).toHaveBeenCalled();
  });

  it('previousSentence should step back', () => {
    component.previousSentence();
    expect(replayServiceSpy.previousSentence).toHaveBeenCalled();
  });

  it('nextSentence should step forward', () => {
    component.nextSentence();
    expect(replayServiceSpy.nextSentence).toHaveBeenCalled();
  });

  it('toggleGroups should toggle group visibility', () => {
    component.toggleGroups();
    expect(replayServiceSpy.toggleShowGroups).toHaveBeenCalled();
  });

  it('openKeyboardShortcutsDialog should open the shortcuts dialog', () => {
    component.openKeyboardShortcutsDialog();
    expect(dialogServiceSpy.openKeyboardShortcutsDialog).toHaveBeenCalled();
  });

  it('openLabelDictionary should open the label dictionary', () => {
    component.openLabelDictionary();
    expect(labelDictionaryServiceSpy.openLabelDictionary).toHaveBeenCalled();
  });

  it('openDownloadDialog should open the export dialog', () => {
    component.openDownloadDialog();
    expect(exportServiceSpy.openDownloadDialog).toHaveBeenCalled();
  });

  it('openImportFromUrlDialog should forward the dirty state', () => {
    dirtySignal.set(true);

    component.openImportFromUrlDialog();

    expect(importServiceSpy.openImportFromUrlDialog).toHaveBeenCalledWith(true);
  });

  describe('getters', () => {
    it('hasDomainStory should reflect the export service', () => {
      exportServiceSpy.isDomainStoryExportable.mockReturnValue(true);
      expect(component.hasDomainStory).toBe(true);
    });

    it('isReplayable should reflect the replay service', () => {
      replayServiceSpy.isReplayable.mockReturnValue(true);
      expect(component.isReplayable).toBe(true);
    });

    it('hasTitle should reflect the properties service', () => {
      propertiesService.updateTitleAndDescriptionAndScope(
        'A real title',
        'desc',
        undefined,
        false,
      );
      expect(component.hasTitle).toBe(true);
    });
  });

  describe('title', () => {
    it('should truncate very long titles', () => {
      const longTitle = 'x'.repeat(250);
      propertiesService.updateTitleAndDescriptionAndScope(
        longTitle,
        'desc',
        undefined,
        false,
      );

      expect(component.title().length).toBe(200);
      expect(component.title().endsWith('...')).toBe(true);
    });
  });
});

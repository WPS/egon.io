import { TestBed } from '@angular/core/testing';

import { AutosaveService } from './autosave.service';
import { MockProviders } from 'ng-mocks';
import { RendererService } from '../Renderer/renderer.service';
import { DomainConfigurationService } from '../DomainConfiguration/domain-configuration.service';
import { ExportService } from '../Export/export.service';
import { AutosaveStateService } from './autosave-state.service';
import { Autosave } from '../../Domain/Autosave/autosave';
import { testConfigAndDst } from '../../Domain/Export/configAndDst';
import { deepCopy } from '../../Utils/deepCopy';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from '../BrowserStorage/storage.service';
import { TitleService } from '../Title/title.service';
import { SaveState } from '../../Domain/Autosave/saveState';

describe('AutosaveService', () => {
  let service: AutosaveService;

  let rendererServiceSpy: jasmine.SpyObj<RendererService>;
  let autosaveStateSpy: jasmine.SpyObj<AutosaveStateService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let titleServiceSpy: jasmine.SpyObj<TitleService>;

  beforeEach(() => {
    const renderServiceMock = jasmine.createSpyObj('RendererService', [
      'importStory',
      'getStory',
      'renderStory',
    ]);
    const autosaveStateServiceMock = jasmine.createSpyObj(
      'AutosaveStateService',
      ['getAutosaveStateAsObservable', 'getAutosaveState', 'setAutosaveState']
    );
    const storageServiceMock = jasmine.createSpyObj('StorageService', [
      'setAutosaveInterval',
      'getAutosaveInterval',
      'getAutosaves',
      'setAutosaves',
      'setMaxAutosaves',
      'getMaxAutosaves',
      'setSaveState',
      'getSaveState'
    ]);
    const titleServiceMock = jasmine.createSpyObj('TitleService', [
      'getTitle',
      'getDescription',
      'updateTitleAndDescription',
    ]);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: RendererService,
          useValue: renderServiceMock,
        },
        {
          provide: AutosaveStateService,
          useValue: autosaveStateServiceMock,
        },
        {
          provide: StorageService,
          useValue: storageServiceMock,
        },
        {
          provide: TitleService,
          useValue: titleServiceMock,
        },
        MockProviders(DomainConfigurationService, ExportService),
      ],
    });
    rendererServiceSpy = TestBed.inject(
      RendererService
    ) as jasmine.SpyObj<RendererService>;
    autosaveStateSpy = TestBed.inject(
      AutosaveStateService
    ) as jasmine.SpyObj<AutosaveStateService>;
    storageServiceSpy = TestBed.inject(
      StorageService
    ) as jasmine.SpyObj<StorageService>;
    titleServiceSpy = TestBed.inject(
      TitleService
    ) as jasmine.SpyObj<TitleService>;

    autosaveStateSpy.getAutosaveStateAsObservable.and.returnValue(
      new BehaviorSubject(false).asObservable()
    );
    autosaveStateSpy.getAutosaveState.and.returnValue(false);
    autosaveStateSpy.setAutosaveState.and.returnValue();

    service = TestBed.inject(AutosaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not autostart when deactivated', () => {
    service
      .getAutosaveEnabledAsObservable()
      .subscribe((value) => expect(value).toBeFalse());
  });

  // TODO test for activated autostart

  describe('applyAutosave', () => {
    beforeEach(() => {
      rendererServiceSpy.importStory.and.returnValue();
    });

    it('should call rendererService.importStory', () => {
      service.loadAutosave(
        createEmptyAutosave(Date.now().toString().slice(0, 25))
      );
      expect(rendererServiceSpy.importStory).toHaveBeenCalled();
    });
  });

  describe('start & stop Autosaving', () => {
    it('should setAutosaveState true when starting', () => {
      service.startAutosaving();
      expect(autosaveStateSpy.setAutosaveState).toHaveBeenCalledWith(true);
    });

    it('should setAutosaveState false when stopping', () => {
      service.stopAutosaving();
      expect(autosaveStateSpy.setAutosaveState).toHaveBeenCalledWith(false);
    });
  });

  it('getAutosaveEnabledAsObservable', () => {
    service
      .getAutosaveEnabledAsObservable()
      .subscribe((value) => expect(value).toBeFalse());
  });

  describe('loadCurrentAutosaves', () => {
    let autosaves: Autosave[] = [];

    beforeEach(() => {
      autosaves = [
        createEmptyAutosave(
          Date.UTC(2000, 1, 1, 1, 1, 1).toString().slice(0, 25)
        ),
        createEmptyAutosave(Date.now().toString().slice(0, 25)),
      ];
    });

    it('should getItem from local Storage', () => {
      storageServiceSpy.getAutosaves.and.returnValue([]);
      const loadedAutosaves = service.loadCurrentAutosaves();

      expect(storageServiceSpy.getAutosaves).toHaveBeenCalled();
      expect(loadedAutosaves).toEqual([]);
    });

    it('should return sorted autosaves', () => {
      storageServiceSpy.getAutosaves.and.returnValue(autosaves);

      const loadedAutosaves = service.loadCurrentAutosaves();

      expect(storageServiceSpy.getAutosaves).toHaveBeenCalled();
      expect(loadedAutosaves).toEqual(autosaves);
    });
  });

  afterEach(() => {
    service.stopAutosaving();
  });

  function createEmptyAutosave(date: string): Autosave {
    return {
      configAndDST: deepCopy(testConfigAndDst),
      date,
    };
  }

  describe('createSaveState', () => {

    it('should set title and description from title service', () => {
      titleServiceSpy.getTitle.and.returnValue('test title');
      titleServiceSpy.getDescription.and.returnValue('test description');
      const saveState = service.createSaveState();

      expect(titleServiceSpy.getTitle).toHaveBeenCalled();
      expect(titleServiceSpy.getDescription).toHaveBeenCalled();
      expect(saveState.title).toEqual('test title');
      expect(saveState.description).toEqual('test description');
    });

    it('should set domain story from renderer service', () => {

    });
  });

  describe('loadSaveState', () => {
    const saveState: SaveState = {
      title: 'test title',
      description: 'test description',
      domainStory: []
    };

    beforeEach(() => {
      storageServiceSpy.getSaveState.and.returnValue(saveState);
    });

    it('should getSaveState from local Storage', () => {
      const loadedSaveState = service.loadSaveState();

      expect(storageServiceSpy.getSaveState).toHaveBeenCalled();
      expect(loadedSaveState).toEqual(saveState);
    });

    it('should call titleService.updateTitleAndDescription', () => {
      service.loadSaveState();

      expect(titleServiceSpy.updateTitleAndDescription)
        .toHaveBeenCalledWith(saveState.title, saveState.description, false);
    });

    it('should call rendererService.renderStory', () => {
      service.loadSaveState();

      expect(rendererServiceSpy.renderStory).toHaveBeenCalledWith(saveState.domainStory);
    });

  });


});

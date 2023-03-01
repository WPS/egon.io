import { TestBed } from '@angular/core/testing';

import { AutosaveService } from './autosave.service';
import { MockProviders } from 'ng-mocks';
import { RendererService } from '../Renderer/renderer.service';
import { DomainConfigurationService } from '../DomainConfiguration/domain-configuration.service';
import { ExportService } from '../Export/export.service';
import { AutosaveStateService } from './autosave-state.service';
import { Autosave } from '../../Domain/Autosave/autosave';
import { testConfigAndDst } from '../../Domain/Export/configAndDst';
import { StorageService } from '../BrowserStorage/storage.service';
import { of } from 'rxjs';

describe('AutosaveService', () => {
  let service: AutosaveService;

  let rendererServiceSpy: jasmine.SpyObj<RendererService>;
  let autosaveStateSpy: jasmine.SpyObj<AutosaveStateService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  const autosaveStateServiceMock = jasmine.createSpyObj(
    'AutosaveStateService',
    ['setState'],
    { state$: of({ activated: true, amount: 1, interval: 1 }) }
  );

  beforeEach(() => {
    const renderServiceMock = jasmine.createSpyObj('RendererService', [
      'importStory',
      'getStory',
    ]);
    const storageServiceMock = jasmine.createSpyObj('StorageService', [
      'getAutosaves',
      'setAutosaves',
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

    service = TestBed.inject(AutosaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

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

  function createEmptyAutosave(date: string): Autosave {
    return {
      description: 'desc',
      title: 'title',
      configAndDST: structuredClone(testConfigAndDst),
      date,
    };
  }
});

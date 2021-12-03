import { TestBed } from '@angular/core/testing';

import { AutosaveService } from './autosave.service';
import { MockService } from 'ng-mocks';
import { RendererService } from '../Renderer/renderer.service';
import { DomainConfigurationService } from '../DomainConfiguration/domain-configuration.service';
import { ExportService } from '../Export/export.service';
import { AutosaveStateService } from './autosave-state.service';
import { Autosave } from '../../Domain/Autosave/autosave';
import { testConfigAndDst } from '../../Domain/Export/configAndDst';
import { deepCopy } from '../../Utils/deepCopy';
import { BehaviorSubject } from 'rxjs';
import { Autosaves } from '../../Domain/Autosave/autosaves';

describe('AutosaveService', () => {
  let service: AutosaveService;

  let rendererServiceSpy: jasmine.SpyObj<RendererService>;
  let autosaveStateSpy: jasmine.SpyObj<AutosaveStateService>;

  let setItemSpy: jasmine.Spy;
  let getItemSpy: jasmine.Spy;

  beforeEach(() => {
    const renderServiceMock = jasmine.createSpyObj('RendererService', [
      'importStory',
    ]);
    const autosaveStateServiceMock = jasmine.createSpyObj(
      'AutosaveStateService',
      ['getAutosaveStateAsObservable', 'getAutosaveState', 'setAutosaveState']
    );

    TestBed.configureTestingModule({
      providers: [
        {
          provide: RendererService,
          useValue: renderServiceMock,
        },
        {
          provide: DomainConfigurationService,
          useValue: MockService(DomainConfigurationService),
        },
        {
          provide: ExportService,
          useValue: MockService(ExportService),
        },
        {
          provide: AutosaveStateService,
          useValue: autosaveStateServiceMock,
        },
      ],
    });
    rendererServiceSpy = TestBed.inject(
      RendererService
    ) as jasmine.SpyObj<RendererService>;
    autosaveStateSpy = TestBed.inject(
      AutosaveStateService
    ) as jasmine.SpyObj<AutosaveStateService>;

    autosaveStateSpy.getAutosaveStateAsObservable.and.returnValue(
      new BehaviorSubject(false).asObservable()
    );
    autosaveStateSpy.getAutosaveState.and.returnValue(false);
    autosaveStateSpy.setAutosaveState.and.returnValue();

    service = TestBed.inject(AutosaveService);

    getItemSpy = spyOn(localStorage, 'getItem').and.returnValue('false');
    setItemSpy = spyOn(localStorage, 'setItem').and.returnValue();
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

  describe('changeAutosaveInterval', () => {
    it('', () => {
      service.changeAutosaveInterval(10);

      expect(setItemSpy).toHaveBeenCalledWith('autosaveIntervalTag', '10');
      service
        .getAutosaveIntervalAsObservable()
        .subscribe((value) => expect(value).toEqual(10));
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

  it('getAutosaveIntervalAsObservable', () => {
    service
      .getAutosaveIntervalAsObservable()
      .subscribe((value) => expect(value).toEqual(5));
  });

  describe('loadCurrentAutosaves', () => {
    const autosaves: Autosaves = { autosaves: [] };

    beforeEach(() => {
      autosaves.autosaves = [
        createEmptyAutosave(
          Date.UTC(2000, 1, 1, 1, 1, 1).toString().slice(0, 25)
        ),
        createEmptyAutosave(Date.now().toString().slice(0, 25)),
      ];
    });

    it('should getItem from local Storage', () => {
      getItemSpy.and.returnValue(JSON.stringify({ autosaves: [] }));
      const loadedAutosaves = service.loadCurrentAutosaves();

      expect(getItemSpy).toHaveBeenCalledWith('autosaveTag');
      expect(loadedAutosaves).toEqual([]);
    });

    it('should return sorted autosaves', () => {
      getItemSpy.and.returnValue(JSON.stringify(autosaves));

      const loadedAutosaves = service.loadCurrentAutosaves();

      expect(getItemSpy).toHaveBeenCalled();
      expect(loadedAutosaves).toEqual(autosaves.autosaves);
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
});

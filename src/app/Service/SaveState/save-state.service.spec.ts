import { TestBed } from '@angular/core/testing';

import { SaveStateService } from './save-state.service';
import { StorageService } from '../BrowserStorage/storage.service';
import { TitleService } from '../Title/title.service';
import { RendererService } from '../Renderer/renderer.service';
import { SaveState } from '../../Domain/SaveState/saveState';
import { testBusinessObject } from '../../Domain/Common/businessObject';

describe('SaveStateService', () => {
  let service: SaveStateService;

  let rendererServiceSpy: jasmine.SpyObj<RendererService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let titleServiceSpy: jasmine.SpyObj<TitleService>;

  beforeEach(() => {
    const renderServiceMock = jasmine.createSpyObj('RendererService', [
      'importStory',
      'getStory',
      'renderStory',
    ]);
    const storageServiceMock = jasmine.createSpyObj('StorageService', [
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
          provide: StorageService,
          useValue: storageServiceMock,
        },
        {
          provide: TitleService,
          useValue: titleServiceMock,
        },
      ]
    });
    rendererServiceSpy = TestBed.inject(
      RendererService
    ) as jasmine.SpyObj<RendererService>;
    storageServiceSpy = TestBed.inject(
      StorageService
    ) as jasmine.SpyObj<StorageService>;
    titleServiceSpy = TestBed.inject(
      TitleService
    ) as jasmine.SpyObj<TitleService>;


    service = TestBed.inject(SaveStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

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

    it('should load domain story from renderer service', () => {
      rendererServiceSpy.getStory.and.returnValue([testBusinessObject])
      const saveState = service.createSaveState();

      expect(rendererServiceSpy.getStory).toHaveBeenCalled();
      expect(saveState.domainStory).toEqual([testBusinessObject]);
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

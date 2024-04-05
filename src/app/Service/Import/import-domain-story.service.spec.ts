import { TestBed } from '@angular/core/testing';

import { ImportDomainStoryService } from 'src/app/Service/Import/import-domain-story.service';
import { ElementRegistryService } from '../ElementRegistry/element-registry.service';
import { IconDictionaryService } from '../DomainConfiguration/icon-dictionary.service';
import { DirtyFlagService } from '../DirtyFlag/dirty-flag.service';
import { ImportRepairService } from './import-repair.service';
import { TitleService } from '../Title/title.service';
import { RendererService } from '../Renderer/renderer.service';
import { MockService } from 'ng-mocks';
import { DialogService } from '../Dialog/dialog.service';
import { DomainConfiguration } from '../../Domain/Common/domainConfiguration';
import { INITIAL_DOMAIN_NAME } from '../../Domain/Common/constants';
import { Dictionary } from '../../Domain/Common/dictionary/dictionary';
import { elementTypes } from '../../Domain/Common/elementTypes';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('ImportDomainStoryService', () => {
  let service: ImportDomainStoryService;

  let iconDictionarySpy: jasmine.SpyObj<IconDictionaryService>;

  beforeEach(() => {
    const iconDictionaryMock = jasmine.createSpyObj('iconDictionaryService', [
      'getTypeDictionaryKeys',
    ]);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ElementRegistryService,
          useValue: MockService(ElementRegistryService),
        },
        {
          provide: IconDictionaryService,
          useValue: iconDictionaryMock,
        },
        {
          provide: DirtyFlagService,
        },
        {
          provide: ImportRepairService,
          useValue: MockService(ImportRepairService),
        },
        {
          provide: TitleService,
        },
        {
          provide: RendererService,
          useValue: MockService(RendererService),
        },
        {
          provide: DialogService,
          useValue: MockService(DialogService),
        },
        {
          provide: MatSnackBar,
          useValue: MockService(MatSnackBar),
        },
      ],
    });
    iconDictionarySpy = TestBed.inject(
      IconDictionaryService,
    ) as jasmine.SpyObj<IconDictionaryService>;
    service = TestBed.inject(ImportDomainStoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('checkConfigForChanges', () => {
    const actorsDict = new Dictionary();
    const workObjectsDict = new Dictionary();

    actorsDict.add('', 'actor');
    workObjectsDict.add('', 'workObject');

    const testDomainCofiguration: DomainConfiguration = {
      name: INITIAL_DOMAIN_NAME,
      actors: actorsDict,
      workObjects: workObjectsDict,
    };

    it('should find changes, more actors', () => {
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(elementTypes.ACTOR)
        .and.returnValue(['test']);
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(elementTypes.WORKOBJECT)
        .and.returnValue(['workObject']);

      expect(
        service.checkConfigForChanges(testDomainCofiguration),
      ).toBeTruthy();
    });

    it('should find changes, different actors', () => {
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(elementTypes.ACTOR)
        .and.returnValue(['actor', 'test']);
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(elementTypes.WORKOBJECT)
        .and.returnValue(['workObject']);

      expect(
        service.checkConfigForChanges(testDomainCofiguration),
      ).toBeTruthy();
    });

    it('should find changes, different workobjects', () => {
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(elementTypes.ACTOR)
        .and.returnValue(['actor']);
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(elementTypes.WORKOBJECT)
        .and.returnValue(['workObject', 'test']);

      expect(
        service.checkConfigForChanges(testDomainCofiguration),
      ).toBeTruthy();
    });

    it('should find changes, different workobjects', () => {
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(elementTypes.ACTOR)
        .and.returnValue(['actor']);
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(elementTypes.WORKOBJECT)
        .and.returnValue(['test']);

      expect(
        service.checkConfigForChanges(testDomainCofiguration),
      ).toBeTruthy();
    });

    it('should not find changes', () => {
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(elementTypes.ACTOR)
        .and.returnValue(['actor']);
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(elementTypes.WORKOBJECT)
        .and.returnValue(['workObject']);

      expect(service.checkConfigForChanges(testDomainCofiguration)).toBeFalsy();
    });
  });
});

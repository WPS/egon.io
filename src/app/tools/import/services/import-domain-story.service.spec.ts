import { TestBed } from '@angular/core/testing';

import { ImportDomainStoryService } from 'src/app/tools/import/services/import-domain-story.service';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';
import { IconDictionaryService } from '../../icon-set-config/services/icon-dictionary.service';
import { DirtyFlagService } from '../../../domain/services/dirty-flag.service';
import { ImportRepairService } from './import-repair.service';
import { TitleService } from '../../title/services/title.service';
import { RendererService } from '../../modeler/services/renderer.service';
import { MockService } from 'ng-mocks';
import { DialogService } from '../../../domain/services/dialog.service';
import { INITIAL_ICON_SET_NAME } from '../../../domain/entities/constants';
import { Dictionary } from '../../../domain/entities/dictionary';
import { ElementTypes } from '../../../domain/entities/elementTypes';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IconSetConfiguration } from '../../../domain/entities/icon-set-configuration';

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

    const testDomainCofiguration: IconSetConfiguration = {
      name: INITIAL_ICON_SET_NAME,
      actors: actorsDict,
      workObjects: workObjectsDict,
    };

    it('should find changes, more actors', () => {
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(ElementTypes.ACTOR)
        .and.returnValue(['test']);
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(ElementTypes.WORKOBJECT)
        .and.returnValue(['workObject']);

      expect(
        service.checkConfigForChanges(testDomainCofiguration),
      ).toBeTruthy();
    });

    it('should find changes, different actors', () => {
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(ElementTypes.ACTOR)
        .and.returnValue(['actor', 'test']);
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(ElementTypes.WORKOBJECT)
        .and.returnValue(['workObject']);

      expect(
        service.checkConfigForChanges(testDomainCofiguration),
      ).toBeTruthy();
    });

    it('should find changes, different workobjects', () => {
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(ElementTypes.ACTOR)
        .and.returnValue(['actor']);
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(ElementTypes.WORKOBJECT)
        .and.returnValue(['workObject', 'test']);

      expect(
        service.checkConfigForChanges(testDomainCofiguration),
      ).toBeTruthy();
    });

    it('should find changes, different workobjects', () => {
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(ElementTypes.ACTOR)
        .and.returnValue(['actor']);
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(ElementTypes.WORKOBJECT)
        .and.returnValue(['test']);

      expect(
        service.checkConfigForChanges(testDomainCofiguration),
      ).toBeTruthy();
    });

    it('should not find changes', () => {
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(ElementTypes.ACTOR)
        .and.returnValue(['actor']);
      iconDictionarySpy.getTypeDictionaryKeys
        .withArgs(ElementTypes.WORKOBJECT)
        .and.returnValue(['workObject']);

      expect(service.checkConfigForChanges(testDomainCofiguration)).toBeFalsy();
    });
  });

  describe('should process title of story correctly', () => {
    const input: Blob = new File([], '');
    let filename: string;
    let isSvg: boolean;
    let expectedTitle: string;

    beforeEach(function () {
      spyOn(TitleService.prototype, 'updateTitleAndDescription');
    });

    it('.egn', () => {
      filename = 'meine domain story.egn';
      isSvg = false;
      expectedTitle = 'meine domain story';
      service.importEGN(input, filename, isSvg);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });

    it('.egn.svg', () => {
      filename = 'meine domain story.egn.svg';
      isSvg = true;
      expectedTitle = 'meine domain story';
      service.importEGN(input, filename, isSvg);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });

    it('.dst', () => {
      filename = 'meine domain story.dst';
      isSvg = false;
      expectedTitle = 'meine domain story';
      service.importDST(input, filename, isSvg);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });

    it('.dst.svg', () => {
      filename = 'meine domain story.dst.svg';
      isSvg = true;
      expectedTitle = 'meine domain story';
      service.importDST(input, filename, isSvg);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });

    it('.egn mit Datum', () => {
      filename =
        'alphorn-5a-riskassessment-fine-digitalized-tobe-colored_2024-08-08.egn';
      isSvg = false;
      expectedTitle = 'alphorn-5a-riskassessment-fine-digitalized-tobe-colored';
      service.importEGN(input, filename, isSvg);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });

    it('.egn.svg mit Datum', () => {
      filename =
        'alphorn-1a-standardcase-withboundaries-coarse-pure-asis_2024-08-08.egn.svg';
      isSvg = true;
      expectedTitle = 'alphorn-1a-standardcase-withboundaries-coarse-pure-asis';
      service.importEGN(input, filename, isSvg);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });

    it('.dst mit Datum', () => {
      filename = 'Organizing an investment conference_2024-08-08.dst';
      isSvg = false;
      expectedTitle = 'Organizing an investment conference';
      service.importDST(input, filename, isSvg);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });
  });
});

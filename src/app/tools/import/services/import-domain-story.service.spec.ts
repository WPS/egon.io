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
import { IconSet } from '../../../domain/entities/iconSet';
import { DomainStory } from '../../../domain/entities/domainStory';

import * as dst_v_1_0_0 from './test-files/dst_export_version_1_0_0.json';
import * as dst_v_1_1_0 from './test-files/dst_export_version_1_1_0.json';
import * as dst_v_1_2_0 from './test-files/dst_export_version_1_2_0.json';
import * as dst_v_1_3_0 from './test-files/dst_export_version_1_3_0.json';
import * as dst_v_1_4_0 from './test-files/dst_export_version_1_4_0.json';
import * as dst_v_1_5_0 from './test-files/dst_export_version_1_5_0.json';
import * as dst_v_2_2_0 from './test-files/dst_export_version_2_2_0.json';
import * as domain_story from './test-files/dst_export_version_2_2_0_dev_new-domain-story.json';

describe('ImportDomainStoryService', () => {
  let service: ImportDomainStoryService;

  let iconDictionarySpy: jasmine.SpyObj<IconDictionaryService>;

  beforeEach(() => {
    const iconDictionaryMock = jasmine.createSpyObj('iconDictionaryService', [
      'getNamesOfIconsAssignedAs',
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

    const testDomainCofiguration: IconSet = {
      name: INITIAL_ICON_SET_NAME,
      actors: actorsDict,
      workObjects: workObjectsDict,
    };

    it('should find changes, more actors', () => {
      iconDictionarySpy.getNamesOfIconsAssignedAs
        .withArgs(ElementTypes.ACTOR)
        .and.returnValue(['test']);
      iconDictionarySpy.getNamesOfIconsAssignedAs
        .withArgs(ElementTypes.WORKOBJECT)
        .and.returnValue(['workObject']);

      expect(
        service.checkConfigForChanges(testDomainCofiguration),
      ).toBeTruthy();
    });

    it('should find changes, different actors', () => {
      iconDictionarySpy.getNamesOfIconsAssignedAs
        .withArgs(ElementTypes.ACTOR)
        .and.returnValue(['actor', 'test']);
      iconDictionarySpy.getNamesOfIconsAssignedAs
        .withArgs(ElementTypes.WORKOBJECT)
        .and.returnValue(['workObject']);

      expect(
        service.checkConfigForChanges(testDomainCofiguration),
      ).toBeTruthy();
    });

    it('should find changes, different workobjects', () => {
      iconDictionarySpy.getNamesOfIconsAssignedAs
        .withArgs(ElementTypes.ACTOR)
        .and.returnValue(['actor']);
      iconDictionarySpy.getNamesOfIconsAssignedAs
        .withArgs(ElementTypes.WORKOBJECT)
        .and.returnValue(['workObject', 'test']);

      expect(
        service.checkConfigForChanges(testDomainCofiguration),
      ).toBeTruthy();
    });

    it('should find changes, different workobjects', () => {
      iconDictionarySpy.getNamesOfIconsAssignedAs
        .withArgs(ElementTypes.ACTOR)
        .and.returnValue(['actor']);
      iconDictionarySpy.getNamesOfIconsAssignedAs
        .withArgs(ElementTypes.WORKOBJECT)
        .and.returnValue(['test']);

      expect(
        service.checkConfigForChanges(testDomainCofiguration),
      ).toBeTruthy();
    });

    it('should not find changes', () => {
      iconDictionarySpy.getNamesOfIconsAssignedAs
        .withArgs(ElementTypes.ACTOR)
        .and.returnValue(['actor']);
      iconDictionarySpy.getNamesOfIconsAssignedAs
        .withArgs(ElementTypes.WORKOBJECT)
        .and.returnValue(['workObject']);

      expect(service.checkConfigForChanges(testDomainCofiguration)).toBeFalsy();
    });
  });

  describe('should process title of story correctly', () => {
    const input: Blob = new File([], '');
    let filename: string;
    let expectedTitle: string;

    beforeEach(function () {
      spyOn(TitleService.prototype, 'updateTitleAndDescription');
    });

    it('.egn', () => {
      filename = 'meine domain story.egn';
      expectedTitle = 'meine domain story';
      service.import(input, filename);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });

    it('.egn.svg', () => {
      filename = 'meine domain story.egn.svg';
      expectedTitle = 'meine domain story';
      service.import(input, filename);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });

    it('.dst', () => {
      filename = 'meine domain story.dst';
      expectedTitle = 'meine domain story';
      service.import(input, filename);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });

    it('.dst.svg', () => {
      filename = 'meine domain story.dst.svg';
      expectedTitle = 'meine domain story';
      service.import(input, filename);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });

    it('.egn mit Datum', () => {
      filename =
        'alphorn-5a-riskassessment-fine-digitalized-tobe-colored_2024-08-08.egn';
      expectedTitle = 'alphorn-5a-riskassessment-fine-digitalized-tobe-colored';
      service.import(input, filename);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });

    it('.egn.svg mit Datum', () => {
      filename =
        'alphorn-1a-standardcase-withboundaries-coarse-pure-asis_2024-08-08.egn.svg';
      expectedTitle = 'alphorn-1a-standardcase-withboundaries-coarse-pure-asis';
      service.import(input, filename);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });

    it('.dst mit Datum', () => {
      filename = 'Organizing an investment conference_2024-08-08.dst';
      expectedTitle = 'Organizing an investment conference';
      service.import(input, filename);
      expect(
        TitleService.prototype.updateTitleAndDescription,
      ).toHaveBeenCalledWith(expectedTitle, null, false);
    });
  });

  describe('should create DomainStory from import of json-context of ', () => {
    it('dst file in version 1.0.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.dstToDomainStory(
        JSON.stringify(dst_v_1_0_0),
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('shape_8939');
      expect(domainStory!.description).toBe('version 1.0.0');
      expect(domainStory!.version).toBe('1.0.0');
    });

    it('dst file in version 1.1.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.dstToDomainStory(
        JSON.stringify(dst_v_1_1_0),
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('shape_2543');
      expect(domainStory!.description).toBe('version 1.1.0');
      expect(domainStory!.version).toBe('1.1.0');
    });

    it('dst file in version 1.2.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.dstToDomainStory(
        JSON.stringify(dst_v_1_2_0),
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('shape_8939');
      expect(domainStory!.description).toBe('version 1.2.0');
      expect(domainStory!.version).toBe('1.2.0');
    });

    it('dst file in version 1.3.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.dstToDomainStory(
        JSON.stringify(dst_v_1_3_0),
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('shape_2543');
      expect(domainStory!.description).toBe('version 1.3.0');
      expect(domainStory!.version).toBe('1.3.0');
    });

    it('dst file in version 1.4.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.dstToDomainStory(
        JSON.stringify(dst_v_1_4_0),
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('shape_8939');
      expect(domainStory!.description).toBe('version 1.4.0');
      expect(domainStory!.version).toBe('1.4.0');
    });

    it('dst file in version 1.5.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.dstToDomainStory(
        JSON.stringify(dst_v_1_5_0),
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('shape_2543');
      expect(domainStory!.description).toBe('version 1.5.0');
      expect(domainStory!.version).toBe('1.5.0');
    });

    it('dst file in version 2.2.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.dstToDomainStory(
        JSON.stringify(dst_v_2_2_0),
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('connection_5930');
      expect(domainStory!.description).toBe('version 2.2.0');
      expect(domainStory!.version).toBe('2.2.0');
    });

    it('dst file of domain story', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.dstToDomainStory(
        JSON.stringify(domain_story),
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('connection_5930');
      expect(domainStory!.description).toBe(
        'version 2.2.1-dev (implement new DomainStory model)',
      );
      expect(domainStory!.version).toBe('2.2.1-dev');
    });
  });
});

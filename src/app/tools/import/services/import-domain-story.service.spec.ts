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
import {DomainStory} from "../../../domain/entities/domainStory";

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

  it('create DomainStory from alphorn-10-missingpaymentstracking.dst file', ()=> {
    const dstAsJson= {"domain":"{\"name\":\"Alphorn\",\"actors\":{\"Group\":\"<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"48\\\" height=\\\"48\\\" viewBox=\\\"0 0 24 26\\\"><path d=\\\"M0 0h24v24H0z\\\" fill=\\\"none\\\"/><path d=\\\"M16.5 13c-1.2 0-3.07.34-4.5 1-1.43-.67-3.3-1-4.5-1C5.33 13 1 14.08 1 16.25V19h22v-2.75c0-2.17-4.33-3.25-6.5-3.25zm-4 4.5h-10v-1.25c0-.54 2.56-1.75 5-1.75s5 1.21 5 1.75v1.25zm9 0H14v-1.25c0-.46-.2-.86-.52-1.22.88-.3 1.96-.53 3.02-.53 2.44 0 5 1.21 5 1.75v1.25zM7.5 12c1.93 0 3.5-1.57 3.5-3.5S9.43 5 7.5 5 4 6.57 4 8.5 5.57 12 7.5 12zm0-5.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 5.5c1.93 0 3.5-1.57 3.5-3.5S18.43 5 16.5 5 13 6.57 13 8.5s1.57 3.5 3.5 3.5zm0-5.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z\\\"/></svg>\",\"Person\":\"<svg viewBox=\\\"0 0 24 26\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\"><path d=\\\"M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z\\\"/><path d=\\\"M0 0h24v24H0z\\\" fill=\\\"none\\\"/></svg>\",\"System\":\"<svg viewBox=\\\"0 0 24 26\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\"><path d=\\\"M20,18c1.1,0,2-0.9,2-2V6c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6v10c0,1.1,0.9,2,2,2H0v2h24v-2H20z M4,6h16v10H4V6z\\\"/></svg>\",\"Courthouse\":\"<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 26\\\"><path fill=\\\"none\\\" d=\\\"M0 0h24v24H0V0z\\\"/><path d=\\\"M6.5 10h-2v7h2v-7zm6 0h-2v7h2v-7zm8.5 9H2v2h19v-2zm-2.5-9h-2v7h2v-7zm-7-6.74L16.71 6H6.29l5.21-2.74m0-2.26L2 6v2h19V6l-9.5-5z\\\"/></svg>\",\"Business\":\"<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 26\\\"><path fill=\\\"none\\\" d=\\\"M0 0h24v24H0V0z\\\"/><path d=\\\"M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z\\\"/></svg>\"},\"workObjects\":{\"Car\":\"<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 26\\\"><path fill=\\\"none\\\" d=\\\"M0 0h24v24H0V0z\\\"/><path d=\\\"M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z\\\"/><circle cx=\\\"7.5\\\" cy=\\\"14.5\\\" r=\\\"1.5\\\"/><circle cx=\\\"16.5\\\" cy=\\\"14.5\\\" r=\\\"1.5\\\"/></svg>\",\"Conversation\":\"<svg height=\\\"48\\\" viewBox=\\\"0 0 24 26\\\" width=\\\"48\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\"><path d=\\\"M0 0h24v24H0V0z\\\" fill=\\\"none\\\"/><path d=\\\"M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z\\\"/></svg>\",\"Document\":\"<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 26\\\"><path fill=\\\"none\\\" d=\\\"M0 0h24v24H0V0z\\\"/><path d=\\\"M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z\\\"/></svg>\",\"Email\":\"<svg viewBox=\\\"0 0 24 26\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\"><path fill=\\\"none\\\" d=\\\"M0,0h24v24H0V0z\\\"/><path fill-opacity=\\\"0.9\\\" d=\\\"M12,1.95c-5.52,0-10,4.48-10,10s4.48,10,10,10h5v-2h-5c-4.34,0-8-3.66-8-8s3.66-8,8-8s8,3.66,8,8v1.43 c0,0.79-0.71,1.57-1.5,1.57S17,14.17,17,13.38v-1.43c0-2.76-2.24-5-5-5s-5,2.24-5,5s2.24,5,5,5c1.38,0,2.64-0.56,3.54-1.47 c0.65,0.89,1.77,1.47,2.96,1.47c1.97,0,3.5-1.6,3.5-3.57v-1.43C22,6.43,17.52,1.95,12,1.95z M12,14.95c-1.66,0-3-1.34-3-3 s1.34-3,3-3s3,1.34,3,3S13.66,14.95,12,14.95z\\\"/></svg>\",\"Euro\":\"<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 26\\\"><path fill=\\\"none\\\" d=\\\"M0 0h24v24H0V0z\\\"/><path d=\\\"M15 18.5c-2.51 0-4.68-1.42-5.76-3.5H15v-2H8.58c-.05-.33-.08-.66-.08-1s.03-.67.08-1H15V9H9.24C10.32 6.92 12.5 5.5 15 5.5c1.61 0 3.09.59 4.23 1.57L21 5.3C19.41 3.87 17.3 3 15 3c-3.92 0-7.24 2.51-8.48 6H3v2h3.06c-.04.33-.06.66-.06 1s.02.67.06 1H3v2h3.52c1.24 3.49 4.56 6 8.48 6 2.31 0 4.41-.87 6-2.3l-1.78-1.77c-1.13.98-2.6 1.57-4.22 1.57z\\\"/></svg>\",\"Info\":\"<svg height=\\\"48\\\" viewBox=\\\"0 0 24 26\\\" width=\\\"48\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\"><path d=\\\"M0 0h24v24H0z\\\" fill=\\\"none\\\"/><path d=\\\"M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z\\\"/></svg>\",\"Security\":\"<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 28\\\"><path fill=\\\"none\\\" d=\\\"M0 0h24v24H0V0z\\\"/><path d=\\\"M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z\\\"/></svg>\",\"Thumb-up-down\":\"<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 28\\\"><path fill=\\\"none\\\" d=\\\"M0 0h24v24H0V0zm0 0h24v24H0V0z\\\"/><path d=\\\"M12 6c0-.55-.45-1-1-1H5.82l.66-3.18.02-.23c0-.31-.13-.59-.33-.8L5.38 0 .44 4.94C.17 5.21 0 5.59 0 6v6.5c0 .83.67 1.5 1.5 1.5h6.75c.62 0 1.15-.38 1.38-.91l2.26-5.29c.07-.17.11-.36.11-.55V6zm-2 1.13L7.92 12H2V6.21l1.93-1.93L3.36 7H10v.13zM22.5 10h-6.75c-.62 0-1.15.38-1.38.91l-2.26 5.29c-.07.17-.11.36-.11.55V18c0 .55.45 1 1 1h5.18l-.66 3.18-.02.24c0 .31.13.59.33.8l.79.78 4.94-4.94c.27-.27.44-.65.44-1.06v-6.5c0-.83-.67-1.5-1.5-1.5zm-.5 7.79l-1.93 1.93.57-2.72H14v-.13L16.08 12H22v5.79z\\\"/></svg>\",\"Calendar\":\"<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 26\\\"><path fill=\\\"none\\\" d=\\\"M0 0h24v24H0V0z\\\" /><path d=\\\"M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2zM7 11h5v5H7z\\\" /></svg>\",\"Assessment\":\"<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 26\\\"><path fill=\\\"none\\\" d=\\\"M0 0h24v24H0V0z\\\"/><path d=\\\"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z\\\"/></svg>\",\"Receipt\":\"<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 28\\\"><path fill=\\\"none\\\" d=\\\"M0 0h24v24H0V0z\\\"/><path d=\\\"M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5zM19 19.09H5V4.91h14v14.18zM6 15h12v2H6zm0-4h12v2H6zm0-4h12v2H6z\\\"/></svg>\",\"View-List\":\"<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 26\\\"><path opacity=\\\".87\\\" fill=\\\"none\\\" d=\\\"M0 0h24v24H0V0z\\\"/><path d=\\\"M3 5v14h17V5H3zm4 2v2H5V7h2zm-2 6v-2h2v2H5zm0 2h2v2H5v-2zm13 2H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z\\\"/></svg>\"}}","dst":"[{\"type\":\"domainStory:connection\",\"name\":\"\",\"id\":\"connection_4920\",\"waypoints\":[{\"original\":{\"x\":563,\"y\":168},\"x\":563,\"y\":168},{\"original\":{\"x\":602,\"y\":151},\"x\":602,\"y\":151}],\"source\":\"shape_0003\",\"target\":\"shape_1412\",\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:connection\",\"name\":\"\",\"id\":\"connection_7228\",\"waypoints\":[{\"original\":{\"x\":323,\"y\":341},\"x\":323,\"y\":341},{\"original\":{\"x\":314,\"y\":325},\"x\":314,\"y\":325}],\"source\":\"shape_2534\",\"target\":\"shape_2719\",\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:connection\",\"name\":\"\",\"id\":\"connection_1527\",\"waypoints\":[{\"original\":{\"x\":363,\"y\":357},\"x\":363,\"y\":357},{\"original\":{\"x\":396,\"y\":332},\"x\":396,\"y\":332}],\"source\":\"shape_2534\",\"target\":\"shape_0918\",\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:actorPerson\",\"name\":\"risk manager\",\"id\":\"shape_8716\",\"pickedColor\":\"black\",\"x\":75,\"y\":161,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:actorSystem\",\"name\":\"missing_payments_tracking.xls\",\"id\":\"shape_0003\",\"pickedColor\":\"black\",\"x\":514,\"y\":161,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:workObjectEuro\",\"name\":\"unpaid installment\",\"id\":\"shape_1137\",\"pickedColor\":\"black\",\"x\":304,\"y\":161,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:workObjectInfo\",\"name\":\"unpaid installment\",\"id\":\"shape_9800\",\"pickedColor\":\"black\",\"x\":304,\"y\":50,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:actorPerson\",\"name\":\"accountant\",\"id\":\"shape_4174\",\"pickedColor\":\"black\",\"x\":514,\"y\":50,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:textAnnotation\",\"name\":\"\",\"id\":\"shape_1412\",\"x\":602,\"y\":123,\"text\":\"resides on network drive R:\\\\tracking\\\\\",\"number\":56,\"width\":100,\"height\":56,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:actorSystem\",\"name\":\"risk_price_table.xls\",\"id\":\"shape_8123\",\"pickedColor\":\"black\",\"x\":515,\"y\":341,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:workObjectDocument\",\"name\":\"paper version\",\"id\":\"shape_2534\",\"pickedColor\":\"black\",\"x\":304,\"y\":341,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:workObjectDocument\",\"name\":\"data\",\"id\":\"shape_2329\",\"pickedColor\":\"black\",\"x\":674,\"y\":250,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:textAnnotation\",\"name\":\"\",\"id\":\"shape_2719\",\"x\":252,\"y\":283,\"text\":\"on a monthly basis\",\"number\":42,\"width\":100,\"height\":42,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:textAnnotation\",\"name\":\"\",\"id\":\"shape_0918\",\"x\":382,\"y\":276,\"text\":\"used for the the voting of new contracts\",\"number\":56,\"width\":100,\"height\":56,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:activity\",\"name\":\"prints out\",\"id\":\"connection_0625\",\"pickedColor\":\"black\",\"number\":\"4\",\"waypoints\":[{\"original\":{\"x\":126,\"y\":238},\"x\":126,\"y\":243},{\"x\":172,\"y\":379},{\"original\":{\"x\":304,\"y\":379},\"x\":304,\"y\":379}],\"source\":\"shape_8716\",\"target\":\"shape_2534\",\"multipleNumberAllowed\":false,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:activity\",\"name\":\"informs about\",\"id\":\"connection_7080\",\"pickedColor\":\"black\",\"number\":\"1\",\"waypoints\":[{\"original\":{\"x\":514,\"y\":88},\"x\":514,\"y\":88},{\"original\":{\"x\":385,\"y\":88},\"x\":385,\"y\":88}],\"source\":\"shape_4174\",\"target\":\"shape_9800\",\"multipleNumberAllowed\":false,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:activity\",\"name\":\"the\",\"id\":\"connection_3435\",\"pickedColor\":\"black\",\"number\":null,\"waypoints\":[{\"original\":{\"x\":304,\"y\":88},\"x\":304,\"y\":88},{\"x\":202,\"y\":88},{\"original\":{\"x\":132,\"y\":176},\"x\":132,\"y\":176}],\"source\":\"shape_9800\",\"target\":\"shape_8716\",\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:activity\",\"name\":\"enters\",\"id\":\"connection_1328\",\"pickedColor\":\"black\",\"number\":\"2\",\"waypoints\":[{\"original\":{\"x\":156,\"y\":199},\"x\":156,\"y\":199},{\"original\":{\"x\":304,\"y\":199},\"x\":304,\"y\":199}],\"source\":\"shape_8716\",\"target\":\"shape_1137\",\"multipleNumberAllowed\":false,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:activity\",\"name\":\"into\",\"id\":\"connection_1552\",\"pickedColor\":\"black\",\"number\":null,\"waypoints\":[{\"original\":{\"x\":384,\"y\":199},\"x\":384,\"y\":199},{\"original\":{\"x\":514,\"y\":198},\"x\":514,\"y\":198}],\"source\":\"shape_1137\",\"target\":\"shape_0003\",\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:activity\",\"name\":\"of\",\"id\":\"connection_2278\",\"pickedColor\":\"black\",\"number\":null,\"waypoints\":[{\"original\":{\"x\":385,\"y\":379},\"x\":385,\"y\":379},{\"original\":{\"x\":512,\"y\":379},\"x\":512,\"y\":379}],\"source\":\"shape_2534\",\"target\":\"shape_8123\",\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:activity\",\"name\":\"extracts\",\"id\":\"connection_1461\",\"pickedColor\":\"black\",\"number\":\"3\",\"waypoints\":[{\"original\":{\"x\":580,\"y\":364},\"x\":580,\"y\":364},{\"original\":{\"x\":674,\"y\":310},\"x\":674,\"y\":310}],\"source\":\"shape_8123\",\"target\":\"shape_2329\",\"multipleNumberAllowed\":false,\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"type\":\"domainStory:activity\",\"name\":\"from\",\"id\":\"connection_6294\",\"pickedColor\":\"black\",\"number\":null,\"waypoints\":[{\"original\":{\"x\":674,\"y\":263},\"x\":674,\"y\":263},{\"original\":{\"x\":594,\"y\":209},\"x\":594,\"y\":209}],\"source\":\"shape_2329\",\"target\":\"shape_0003\",\"$type\":\"Element\",\"di\":{},\"$descriptor\":{}},{\"info\":\"Test dst file\"},{\"version\":\"1.3.0\"}]"}
    const domainStory: DomainStory | null = service.dstToDomainStory(JSON.stringify(dstAsJson))

    expect(domainStory!.businessObjects.length).toBe(22)
    expect(domainStory!.businessObjects[0].id).toBe('connection_4920')
    expect(domainStory!.info).toBe('Test dst file')
    expect(domainStory!.version).toBe('1.3.0')
  })

  it('create DomainStory from alphorn-10-missingpaymentstracking.dst file', ()=> {
    const dstAsJson= {
      "domain": {
        "name": "Metropolis",
        "actors": {
          "Group": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"48\" viewBox=\"0 0 24 26\"><path d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M16.5 13c-1.2 0-3.07.34-4.5 1-1.43-.67-3.3-1-4.5-1C5.33 13 1 14.08 1 16.25V19h22v-2.75c0-2.17-4.33-3.25-6.5-3.25zm-4 4.5h-10v-1.25c0-.54 2.56-1.75 5-1.75s5 1.21 5 1.75v1.25zm9 0H14v-1.25c0-.46-.2-.86-.52-1.22.88-.3 1.96-.53 3.02-.53 2.44 0 5 1.21 5 1.75v1.25zM7.5 12c1.93 0 3.5-1.57 3.5-3.5S9.43 5 7.5 5 4 6.57 4 8.5 5.57 12 7.5 12zm0-5.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 5.5c1.93 0 3.5-1.57 3.5-3.5S18.43 5 16.5 5 13 6.57 13 8.5s1.57 3.5 3.5 3.5zm0-5.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z\"/></svg>",
          "Person": "<svg viewBox=\"0 0 24 26\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
          "System": "<svg viewBox=\"0 0 24 26\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M20,18c1.1,0,2-0.9,2-2V6c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6v10c0,1.1,0.9,2,2,2H0v2h24v-2H20z M4,6h16v10H4V6z\"/></svg>"
        },
        "workObjects": {
          "Conversation": "<svg height=\"48\" viewBox=\"0 0 24 26\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M0 0h24v24H0V0z\" fill=\"none\"/><path d=\"M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z\"/></svg>",
          "Document": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 26\"><path fill=\"none\" d=\"M0 0h24v24H0V0z\"/><path d=\"M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z\"/></svg>",
          "Info": "<svg height=\"48\" viewBox=\"0 0 24 26\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z\"/></svg>",
          "snacks-custom": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI0djI0SDBWMHoiLz48cGF0aCBkPSJNMSAyMS45OGMwIC41Ni40NSAxLjAxIDEuMDEgMS4wMUgxNWMuNTYgMCAxLjAxLS40NSAxLjAxLTEuMDFWMjFIMXYuOTh6TTguNSA4Ljk5QzQuNzUgOC45OSAxIDExIDEgMTVoMTVjMC00LTMuNzUtNi4wMS03LjUtNi4wMXpNMy42MiAxM2MxLjExLTEuNTUgMy40Ny0yLjAxIDQuODgtMi4wMXMzLjc3LjQ2IDQuODggMi4wMUgzLjYyek0xIDE3aDE1djJIMXpNMTggNVYxaC0ydjRoLTVsLjIzIDJoOS41NmwtMS40IDE0SDE4djJoMS43MmMuODQgMCAxLjUzLS42NSAxLjYzLTEuNDdMMjMgNWgtNXoiLz48L3N2Zz4=",
          "Couch": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 26\"><path fill=\"none\" d=\"M0 0h24v24H0V0z\"/><path d=\"M21 9V7c0-1.65-1.35-3-3-3H6C4.35 4 3 5.35 3 7v2c-1.65 0-3 1.35-3 3v5c0 1.65 1.35 3 3 3h18c1.65 0 3-1.35 3-3v-5c0-1.65-1.35-3-3-3zM5 7c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v2.78c-.61.55-1 1.34-1 2.22v2H6v-2c0-.88-.39-1.67-1-2.22V7zm17 10c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1v-5c0-.55.45-1 1-1s1 .45 1 1v4h16v-4c0-.55.45-1 1-1s1 .45 1 1v5z\"/></svg>",
          "Euro": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 26\"><path fill=\"none\" d=\"M0 0h24v24H0V0z\"/><path d=\"M15 18.5c-2.51 0-4.68-1.42-5.76-3.5H15v-2H8.58c-.05-.33-.08-.66-.08-1s.03-.67.08-1H15V9H9.24C10.32 6.92 12.5 5.5 15 5.5c1.61 0 3.09.59 4.23 1.57L21 5.3C19.41 3.87 17.3 3 15 3c-3.92 0-7.24 2.51-8.48 6H3v2h3.06c-.04.33-.06.66-.06 1s.02.67.06 1H3v2h3.52c1.24 3.49 4.56 6 8.48 6 2.31 0 4.41-.87 6-2.3l-1.78-1.77c-1.13.98-2.6 1.57-4.22 1.57z\"/></svg>",
          "Grid": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 28\"><path d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z\"/></svg>",
          "Receipt": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 28\"><path fill=\"none\" d=\"M0 0h24v24H0V0z\"/><path d=\"M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5zM19 19.09H5V4.91h14v14.18zM6 15h12v2H6zm0-4h12v2H6zm0-4h12v2H6z\"/></svg>",
          "Theater": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 26\"><path fill=\"none\" d=\"M0 0h24v24H0V0z\"/><path d=\"M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm6 10h-4V5h4v14zm4-2h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z\"/></svg>",
          "Email": "<svg viewBox=\"0 0 24 26\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"none\" d=\"M0,0h24v24H0V0z\"/><path fill-opacity=\"0.9\" d=\"M12,1.95c-5.52,0-10,4.48-10,10s4.48,10,10,10h5v-2h-5c-4.34,0-8-3.66-8-8s3.66-8,8-8s8,3.66,8,8v1.43 c0,0.79-0.71,1.57-1.5,1.57S17,14.17,17,13.38v-1.43c0-2.76-2.24-5-5-5s-5,2.24-5,5s2.24,5,5,5c1.38,0,2.64-0.56,3.54-1.47 c0.65,0.89,1.77,1.47,2.96,1.47c1.97,0,3.5-1.6,3.5-3.57v-1.43C22,6.43,17.52,1.95,12,1.95z M12,14.95c-1.66,0-3-1.34-3-3 s1.34-3,3-3s3,1.34,3,3S13.66,14.95,12,14.95z\"/></svg>",
          "Call": "<svg viewBox=\"0 0 24 26\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"none\" d=\"M0,0h24v24H0V0z\"/><path d=\"M6.54,5C6.6,5.89,6.75,6.76,6.99,7.59l-1.2,1.2C5.38,7.59,5.12,6.32,5.03,5H6.54 M16.4,17.02c0.85,0.24,1.72,0.39,2.6,0.45 v1.49c-1.32-0.09-2.59-0.35-3.8-0.75L16.4,17.02 M7.5,3H4C3.45,3,3,3.45,3,4c0,9.39,7.61,17,17,17c0.55,0,1-0.45,1-1v-3.49\tc0-0.55-0.45-1-1-1c-1.24,0-2.45-0.2-3.57-0.57c-0.1-0.04-0.21-0.05-0.31-0.05c-0.26,0-0.51,0.1-0.71,0.29l-2.2,2.2 c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.2C9.1,8.31,9.18,7.92,9.07,7.57C8.7,6.45,8.5,5.25,8.5,4C8.5,3.45,8.05,3,7.5,3L7.5,3z\"/></svg>"
        }
      },
      "dst": [
        {
          "type": "domainStory:activity",
          "name": "startet",
          "id": "connection_1906",
          "number": 5,
          "waypoints": [
            {
              "original": {
                "x": 448,
                "y": 921
              },
              "x": 448,
              "y": 921
            },
            {
              "original": {
                "x": 448,
                "y": 805
              },
              "x": 448,
              "y": 805
            }
          ],
          "source": "shape_7670",
          "target": "shape_5742",
          "pickedColor": "#ff0e0eff",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:activity",
          "name": "kauft",
          "id": "connection_3681",
          "number": "2",
          "waypoints": [
            {
              "original": {
                "x": 524,
                "y": 543
              },
              "x": 524,
              "y": 543
            },
            {
              "original": {
                "x": 673,
                "y": 460
              },
              "x": 673,
              "y": 460
            }
          ],
          "source": "shape_6549",
          "target": "shape_8945",
          "pickedColor": "#0e0effff",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:activity",
          "name": "von",
          "id": "connection_5157",
          "pickedColor": "#0e0effff",
          "number": null,
          "waypoints": [
            {
              "original": {
                "x": 711,
                "y": 390
              },
              "x": 711,
              "y": 390
            },
            {
              "original": {
                "x": 711,
                "y": 304
              },
              "x": 711,
              "y": 304
            }
          ],
          "source": "shape_8945",
          "target": "shape_4967",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:activity",
          "name": "und gewährt Einlass für",
          "id": "connection_5975",
          "number": null,
          "waypoints": [
            {
              "original": {
                "x": 704,
                "y": 745
              },
              "x": 704,
              "y": 745
            },
            {
              "x": 585,
              "y": 745
            },
            {
              "original": {
                "x": 518,
                "y": 604
              },
              "x": 518,
              "y": 604
            }
          ],
          "source": "shape_0649",
          "target": "shape_6549",
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:activity",
          "name": "dem",
          "id": "connection_6164",
          "number": null,
          "waypoints": [
            {
              "original": {
                "x": 835,
                "y": 718
              },
              "x": 835,
              "y": 718
            },
            {
              "x": 835,
              "y": 938
            },
            {
              "original": {
                "x": 795,
                "y": 938
              },
              "x": 795,
              "y": 938
            }
          ],
          "source": "shape_3084",
          "target": "shape_9250",
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:activity",
          "name": "zeigt",
          "id": "connection_6377",
          "number": 3,
          "waypoints": [
            {
              "original": {
                "x": 540,
                "y": 575
              },
              "x": 540,
              "y": 575
            },
            {
              "x": 625,
              "y": 659
            },
            {
              "original": {
                "x": 797,
                "y": 659
              },
              "x": 797,
              "y": 659
            }
          ],
          "source": "shape_6549",
          "target": "shape_3084",
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:activity",
          "name": "kontrolliert",
          "id": "connection_6858",
          "number": 4,
          "waypoints": [
            {
              "original": {
                "x": 742,
                "y": 920
              },
              "x": 742,
              "y": 920
            },
            {
              "original": {
                "x": 742,
                "y": 792
              },
              "x": 742,
              "y": 792
            }
          ],
          "source": "shape_9250",
          "target": "shape_0649",
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:connection",
          "name": "",
          "id": "connection_7383",
          "waypoints": [
            {
              "original": {
                "x": 753,
                "y": 438
              },
              "x": 753,
              "y": 438
            },
            {
              "original": {
                "x": 794,
                "y": 438
              },
              "x": 794,
              "y": 438
            }
          ],
          "source": "shape_8945",
          "target": "shape_7862",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:activity",
          "name": "von",
          "id": "connection_7845",
          "number": null,
          "waypoints": [
            {
              "original": {
                "x": 405,
                "y": 367
              },
              "x": 405,
              "y": 367
            },
            {
              "original": {
                "x": 405,
                "y": 285
              },
              "x": 405,
              "y": 285
            }
          ],
          "source": "shape_7937",
          "target": "shape_9942",
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:activity",
          "name": "schaut an",
          "id": "connection_7909",
          "number": 6,
          "waypoints": [
            {
              "original": {
                "x": 463,
                "y": 603
              },
              "x": 463,
              "y": 603
            },
            {
              "x": 358,
              "y": 660
            },
            {
              "original": {
                "x": 358,
                "y": 720
              },
              "x": 358,
              "y": 720
            }
          ],
          "source": "shape_6549",
          "target": "shape_2080",
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:activity",
          "name": "kauft",
          "id": "connection_8224",
          "number": "1",
          "waypoints": [
            {
              "original": {
                "x": 490,
                "y": 524
              },
              "x": 490,
              "y": 524
            },
            {
              "original": {
                "x": 426,
                "y": 449
              },
              "x": 426,
              "y": 449
            }
          ],
          "source": "shape_6549",
          "target": "shape_7937",
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:activity",
          "name": "für",
          "id": "connection_9254",
          "pickedColor": "#ff0e0eff",
          "number": null,
          "waypoints": [
            {
              "original": {
                "x": 458,
                "y": 725
              },
              "x": 458,
              "y": 725
            },
            {
              "original": {
                "x": 492,
                "y": 609
              },
              "x": 492,
              "y": 609
            }
          ],
          "source": "shape_5742",
          "target": "shape_6549",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:workObjectReceipt",
          "name": "Karte",
          "id": "shape_0649",
          "x": 704,
          "y": 707,
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:workObjectTheater",
          "name": "Film",
          "id": "shape_2080",
          "pickedColor": "black",
          "x": 320,
          "y": 720,
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:group",
          "name": "Einlasskontrolle",
          "id": "shape_2647",
          "x": 567,
          "y": 580,
          "height": 298,
          "width": 328,
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:workObjectReceipt",
          "name": "Karte",
          "id": "shape_3084",
          "x": 797,
          "y": 633,
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:group",
          "name": "Filmvorführung",
          "id": "shape_3194",
          "x": 300,
          "y": 618,
          "height": 260,
          "width": 215,
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:group",
          "name": "Kartenverkauf",
          "id": "shape_3469",
          "x": 303,
          "y": 334,
          "height": 174,
          "width": 212,
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:workObjectInfo",
          "name": "",
          "id": "shape_3756",
          "pickedColor": "#ff0f0fff",
          "x": 998,
          "y": 722,
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:textAnnotation",
          "name": "",
          "id": "shape_3800",
          "x": 1070,
          "y": 740,
          "text": "berücksichtigt die Brandschutzregeln",
          "number": 30,
          "width": 126.1953125,
          "height": 30,
          "$type": "Element",
          "di": {},
          "$descriptor": {},
          "pickedColor": "#ff0f0f"
        },
        {
          "type": "domainStory:textAnnotation",
          "name": "",
          "id": "shape_4371",
          "x": 1070,
          "y": 682,
          "text": "unterliegt Bestimmungen zur Lebensmittelsicherheit",
          "number": 30,
          "width": 151.96875,
          "height": 30,
          "$type": "Element",
          "di": {},
          "$descriptor": {},
          "pickedColor": "#0f0fff"
        },
        {
          "type": "domainStory:actorPerson",
          "name": "Snackverkäufer",
          "id": "shape_4967",
          "x": 673,
          "y": 200,
          "pickedColor": "#0f0fffff",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:workObjectTheater",
          "name": "Film",
          "id": "shape_5742",
          "x": 410,
          "y": 720,
          "pickedColor": "#ff0f0fff",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:workObjectInfo",
          "name": "",
          "id": "shape_5916",
          "pickedColor": "#0f0fffff",
          "x": 998,
          "y": 663,
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:actorPerson",
          "name": "Kinobesucher",
          "id": "shape_6549",
          "x": 463,
          "y": 524,
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:textAnnotation",
          "name": "",
          "id": "shape_7380",
          "x": 1016,
          "y": 636,
          "text": "Rechtliche Auflagen:",
          "number": 30,
          "width": 137,
          "height": 30,
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:actorPerson",
          "name": "Filmvorführer",
          "id": "shape_7670",
          "x": 405,
          "y": 920,
          "pickedColor": "#ff0f0fff",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:textAnnotation",
          "name": "",
          "id": "shape_7862",
          "x": 795,
          "y": 423,
          "text": "optional",
          "number": 30,
          "width": 60,
          "height": 30,
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:workObjectReceipt",
          "name": "Karte",
          "id": "shape_7937",
          "x": 367,
          "y": 367,
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:group",
          "name": "Snackverkauf",
          "id": "shape_8674",
          "x": 575,
          "y": 328,
          "height": 191,
          "width": 306,
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:workObjectsnacks-custom",
          "name": "Snacks und Getränke",
          "id": "shape_8945",
          "x": 673,
          "y": 390,
          "$type": "Element",
          "di": {},
          "$descriptor": {},
          "pickedColor": "#0f0fff"
        },
        {
          "type": "domainStory:actorPerson",
          "name": "Einlasser",
          "id": "shape_9250",
          "x": 718,
          "y": 920,
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "type": "domainStory:actorPerson",
          "name": "Kassierer",
          "id": "shape_9942",
          "x": 367,
          "y": 200,
          "pickedColor": "black",
          "$type": "Element",
          "di": {},
          "$descriptor": {}
        },
        {
          "info": ""
        },
        {
          "version": "2.2.0-dev"
        }
      ]
    }
    const domainStory: DomainStory | null = service.dstToDomainStory(JSON.stringify(dstAsJson))

    expect(domainStory!.businessObjects.length).toBe(22)
    expect(domainStory!.businessObjects[0].id).toBe('connection_4920')
    expect(domainStory!.info).toBe('Test dst file')
    expect(domainStory!.version).toBe('1.3.0')
  })
});

import { TestBed } from '@angular/core/testing';

import { LabelDictionaryService } from 'src/app/tools/label-dictionary/services/label-dictionary.service';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SNACKBAR_DURATION_LONGER,
  SNACKBAR_INFO,
} from '../../../domain/entities/constants';
import {
  CanvasObject,
  testCanvasObject,
} from '../../../domain/entities/canvasObject';
import { ElementTypes } from '../../../domain/entities/elementTypes';
import { DialogService } from '../../../domain/services/dialog.service';
import { testActivityCanvasObject } from '../../../domain/entities/activityCanvasObject';
import { MassNamingService } from './mass-naming.service';

describe('LabelDictionaryService', () => {
  let service: LabelDictionaryService;

  let massNamingServiceSpy: jasmine.SpyObj<MassNamingService>;
  let elementRegistryService: ElementRegistryService;
  let dialogServiceSpy: DialogService;
  let matSnackbarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    const massNamingServiceMock = jasmine.createSpyObj(MassNamingService.name, [
      'massChangeNames',
    ]);
    const dialogServiceMock = jasmine.createSpyObj(DialogService.name, [
      'openDialog',
    ]);
    const matSnackbarMock = jasmine.createSpyObj(MatSnackBar.name, ['open']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MassNamingService,
          useValue: massNamingServiceMock,
        },
        {
          provide: DialogService,
          useValue: dialogServiceMock,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackbarMock,
        },
      ],
    });
    massNamingServiceSpy = TestBed.inject(
      MassNamingService,
    ) as jasmine.SpyObj<MassNamingService>;
    dialogServiceSpy = TestBed.inject(
      DialogService,
    ) as jasmine.SpyObj<DialogService>;
    matSnackbarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    elementRegistryService = TestBed.inject(ElementRegistryService);
    service = TestBed.inject(LabelDictionaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not open label dictionary when element registry is empty', () => {
    elementRegistryService.setElementRegistry({ _elements: [] });
    service.openLabelDictionary();
    expect(dialogServiceSpy.openDialog).not.toHaveBeenCalled();
    expect(matSnackbarSpy.open).toHaveBeenCalledWith(
      'There are currently no activities or work objects with labels on the canvas',
      undefined,
      {
        duration: SNACKBAR_DURATION_LONGER,
        panelClass: SNACKBAR_INFO,
      },
    );
  });

  it('should open label dictionary when element registry is not empty', () => {
    populateElementRegistry();
    service.openLabelDictionary();
    expect(dialogServiceSpy.openDialog).toHaveBeenCalled();
    expect(matSnackbarSpy.open).not.toHaveBeenCalled();
  });

  it('should create label dictionaries', () => {
    populateElementRegistry();
    service.createLabelDictionaries();
    expect(service.getUniqueWorkObjectNames()).toEqual([
      'ZERO',
      'ONE',
      'TWO',
      'THREE',
    ]);
    expect(service.getWorkObjectLabels().map((entry) => entry.name)).toEqual([
      'ONE',
      'THREE',
      'TWO',
    ]);
    expect(service.getActivityLabels().map((entry) => entry.name)).toEqual([
      'one',
      'three',
      'two',
    ]);
  });

  it('should rename lables', () => {
    populateElementRegistry();
    service.createLabelDictionaries();
    service.massRenameLabels(
      ['uno', 'two'],
      ['one', 'two', 'three'],
      ['UNO', 'TWO'],
      ['ONE', 'TWO', 'THREE'],
    );
    expect(massNamingServiceSpy.massChangeNames).toHaveBeenCalledTimes(4);
    let args: Array<Array<any>> = massNamingServiceSpy.massChangeNames.calls
      .all()
      .map((obj) => obj.args);
    expect(args).toEqual([
      ['one', 'uno', ElementTypes.ACTIVITY],
      ['three', '', ElementTypes.ACTIVITY],
      ['ONE', 'UNO', ElementTypes.WORKOBJECT],
      ['THREE', '', ElementTypes.WORKOBJECT],
    ]);
  });

  function populateElementRegistry() {
    let workObject: CanvasObject = structuredClone(testCanvasObject);
    workObject.type = ElementTypes.WORKOBJECT + 'Info';
    let activity: CanvasObject = structuredClone(testActivityCanvasObject);
    activity.type = ElementTypes.ACTIVITY;

    let elements: { [key: string]: { element: CanvasObject } } = {
      ZERO: { element: structuredClone(workObject) },
      ONE: { element: structuredClone(workObject) },
      TWO: { element: structuredClone(workObject) },
      THREE: { element: structuredClone(workObject) },
      one: { element: structuredClone(activity) },
      two: { element: structuredClone(activity) },
      three: { element: structuredClone(activity) },
    };
    elements['ZERO'].element.type = ElementTypes.WORKOBJECT;
    for (let key of Object.keys(elements)) {
      elements[key].element.name = key;
      elements[key].element.businessObject.name = key;
    }

    elementRegistryService.setElementRegistry({ _elements: elements });
  }
});

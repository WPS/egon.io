import { TestBed } from '@angular/core/testing';
import { MockProviders } from 'ng-mocks';

import { ActivityClickHandlerService } from 'src/app/tools/activity/services/activity-click-handler.service';
import { DialogService } from 'src/app/tools/dialog/services/dialog.service';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { CommandStackService } from 'src/app/tools/modeler/services/command-stack.service';
import { DomManipulationService } from 'src/app/tools/replay/services/dom-manipulation.service';
import { ActivityDialogComponent } from 'src/app/tools/activity/presentation/activity-dialog.component';
import {
  ActivityDialogData,
  ActivityDialogSaveData,
} from 'src/app/tools/activity/domain/activity-dialog-data';
import { ElementTypes } from 'src/app/domain/entities/element-types';
import {
  ActivityCanvasObject,
  testActivityCanvasObject,
} from 'src/app/domain/entities/activity-canvas-object';
import { testCanvasObject } from 'src/app/domain/entities/canvas-object';
import {
  isNumberMultiple,
  setNumberIsMultiple,
  updateExistingNumbersAtEditing,
} from 'src/app/tools/modeler/diagram-js/features/numbering/numbering';
import { toggleStashUse } from 'src/app/tools/modeler/diagram-js/features/labeling/dsLabelEditingProvider';

jest.mock(
  'src/app/tools/modeler/diagram-js/features/numbering/numbering',
  () => ({
    isNumberMultiple: jest.fn(),
    setNumberIsMultiple: jest.fn(),
    updateExistingNumbersAtEditing: jest.fn(),
  }),
);
jest.mock(
  'src/app/tools/modeler/diagram-js/features/labeling/dsLabelEditingProvider',
  () => ({
    toggleStashUse: jest.fn(),
  }),
);

describe('ActivityClickHandlerService', () => {
  let service: ActivityClickHandlerService;
  let dialogServiceSpy: jest.Mocked<DialogService>;
  let elementRegistryServiceSpy: jest.Mocked<ElementRegistryService>;
  let commandStackServiceSpy: jest.Mocked<CommandStackService>;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        MockProviders(
          DialogService,
          ElementRegistryService,
          CommandStackService,
          DomManipulationService,
        ),
      ],
    });
    dialogServiceSpy = TestBed.inject(
      DialogService,
    ) as jest.Mocked<DialogService>;
    elementRegistryServiceSpy = TestBed.inject(
      ElementRegistryService,
    ) as jest.Mocked<ElementRegistryService>;
    commandStackServiceSpy = TestBed.inject(
      CommandStackService,
    ) as jest.Mocked<CommandStackService>;
    service = TestBed.inject(ActivityClickHandlerService);
  });

  function makeActivity(
    sourceType: string,
    number: number | undefined,
  ): ActivityCanvasObject {
    const activity = structuredClone(testActivityCanvasObject);
    activity.source = {
      ...structuredClone(testCanvasObject),
      type: sourceType,
    };
    activity.businessObject.number = number;
    return activity;
  }

  function capturedDialogData(): ActivityDialogData {
    const config = dialogServiceSpy.openDialog.mock.calls[0][1];
    return config.data as ActivityDialogData;
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('activityDoubleClick', () => {
    it('should reset the stash before opening the dialog', () => {
      service.activityDoubleClick(makeActivity(ElementTypes.ACTOR, 1));

      expect(toggleStashUse).toHaveBeenCalledWith(false);
    });

    it('should show number fields for an activity originating from an actor', () => {
      (isNumberMultiple as jest.Mock).mockReturnValue(false);

      service.activityDoubleClick(makeActivity(ElementTypes.ACTOR, 3));

      expect(dialogServiceSpy.openDialog).toHaveBeenCalledWith(
        ActivityDialogComponent,
        expect.anything(),
      );
      const data = capturedDialogData();
      expect(data.showNumberFields).toBe(true);
      expect(isNumberMultiple).toHaveBeenCalledWith(3);
    });

    it('should hide number fields for an activity originating from a work object', () => {
      service.activityDoubleClick(
        makeActivity(ElementTypes.WORKOBJECT, undefined),
      );

      const data = capturedDialogData();
      expect(data.showNumberFields).toBe(false);
    });

    it('should still open the dialog when the source is neither actor nor work object', () => {
      service.activityDoubleClick(makeActivity(ElementTypes.GROUP, undefined));

      expect(dialogServiceSpy.openDialog).toHaveBeenCalled();
    });
  });

  describe('saveActivityInputLabel (via dialog save callback)', () => {
    function openAndGetSaveFn(): ActivityDialogData {
      service.activityDoubleClick(makeActivity(ElementTypes.ACTOR, 1));
      return capturedDialogData();
    }

    it('should execute activity.changed with a number and update numbers when multiple is allowed', () => {
      (isNumberMultiple as jest.Mock).mockReturnValue(false);
      const data = openAndGetSaveFn();
      const activity = data.activity;
      elementRegistryServiceSpy.getActivitiesFromActors.mockReturnValue([
        activity,
      ]);

      const saveData: ActivityDialogSaveData = {
        activity,
        activityLabel: 'new label',
        activityNumber: 5,
        multipleNumbers: true,
      };
      data.saveFN(saveData);

      expect(setNumberIsMultiple).toHaveBeenCalledWith(5, true);
      expect(commandStackServiceSpy.execute).toHaveBeenCalledWith(
        'activity.changed',
        expect.objectContaining({ newLabel: 'new label', newNumber: 5 }),
      );
      expect(updateExistingNumbersAtEditing).toHaveBeenCalled();
    });

    it('should not re-number when the number is already flagged as multiple', () => {
      (isNumberMultiple as jest.Mock).mockReturnValue(true);
      const data = openAndGetSaveFn();
      const activity = data.activity;
      elementRegistryServiceSpy.getActivitiesFromActors.mockReturnValue([
        activity,
      ]);

      data.saveFN({
        activity,
        activityLabel: 'label',
        activityNumber: 5,
        multipleNumbers: true,
      });

      expect(updateExistingNumbersAtEditing).not.toHaveBeenCalled();
    });

    it('should execute activity.changed without a number when none is provided', () => {
      const data = openAndGetSaveFn();
      const activity = data.activity;
      elementRegistryServiceSpy.getActivitiesFromActors.mockReturnValue([
        activity,
      ]);

      data.saveFN({ activity, activityLabel: 'label' });

      expect(setNumberIsMultiple).not.toHaveBeenCalled();
      expect(commandStackServiceSpy.execute).toHaveBeenCalledWith(
        'activity.changed',
        expect.objectContaining({ newLabel: 'label' }),
      );
      // multipleNumberAllowed becomes false -> the else-if branch re-numbers
      expect(updateExistingNumbersAtEditing).toHaveBeenCalled();
    });
  });

  describe('activityNumberDoubleClick', () => {
    it('should do nothing when there are no rendered numbers', () => {
      (
        TestBed.inject(DomManipulationService).getRenderedNumbers as jest.Mock
      ).mockReturnValue([]);
      elementRegistryServiceSpy.getActivitiesFromActors.mockReturnValue([]);

      service.activityNumberDoubleClick({ originalEvent: {} });

      expect(dialogServiceSpy.openDialog).not.toHaveBeenCalled();
    });
  });
});

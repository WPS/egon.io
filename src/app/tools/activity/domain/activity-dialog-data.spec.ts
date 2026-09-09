import {
  ActivityDialogData,
  ActivityDialogSaveData,
} from 'src/app/tools/activity/domain/activity-dialog-data';
import { testActivityCanvasObject } from 'src/app/domain/entities/activity-canvas-object';

describe('ActivityDialogData', () => {
  it('should store all constructor arguments', () => {
    const activity = testActivityCanvasObject;
    const saveFn = (_: ActivityDialogSaveData) => undefined;

    const data = new ActivityDialogData(activity, true, false, saveFn);

    expect(data.activity).toBe(activity);
    expect(data.numberIsAllowedMultipleTimes).toBe(true);
    expect(data.showNumberFields).toBe(false);
    expect(data.saveFN).toBe(saveFn);
  });

  it('should invoke the stored save function', () => {
    const saveFn = jest.fn();
    const data = new ActivityDialogData(
      testActivityCanvasObject,
      false,
      true,
      saveFn,
    );

    const payload: ActivityDialogSaveData = {
      activity: testActivityCanvasObject,
      activityLabel: 'label',
    };
    data.saveFN(payload);

    expect(saveFn).toHaveBeenCalledWith(payload);
  });
});

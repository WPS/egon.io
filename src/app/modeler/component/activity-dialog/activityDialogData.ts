import { ActivityCanvasObject } from '../../../common/domain/activityCanvasObject';

export class ActivityDialogData {
  public activity: ActivityCanvasObject;
  public numberIsAllowedMultipleTimes: boolean;
  public showNumberFields: boolean;

  public saveFN: any;

  constructor(
    activity: ActivityCanvasObject,
    numberIsAllowedMultipleTimes: boolean,
    showNumberFields: boolean,
    saveFN: any
  ) {
    this.activity = activity;
    this.numberIsAllowedMultipleTimes = numberIsAllowedMultipleTimes;
    this.showNumberFields = showNumberFields;
    this.saveFN = saveFN;
  }
}

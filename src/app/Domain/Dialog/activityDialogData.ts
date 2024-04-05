import { ActivityCanvasObject } from '../Common/activityCanvasObject';

export class ActivityDialogData {
  activity: ActivityCanvasObject;
  numberIsAllowedMultipleTimes: boolean;
  showNumberFields: boolean;

  saveFN: any;

  constructor(
    activity: ActivityCanvasObject,
    numberIsAllowedMultipleTimes: boolean,
    showNumberFields: boolean,
    saveFN: any,
  ) {
    this.activity = activity;
    this.numberIsAllowedMultipleTimes = numberIsAllowedMultipleTimes;
    this.showNumberFields = showNumberFields;
    this.saveFN = saveFN;
  }
}

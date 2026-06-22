import { ActivityCanvasObject } from '../../../domain/entities/activityCanvasObject';

export class ActivityDialogData {
  activity: ActivityCanvasObject;
  numberIsAllowedMultipleTimes: boolean;
  showNumberFields: boolean;

  saveFN: (data: any) => void;

  constructor(
    activity: ActivityCanvasObject,
    numberIsAllowedMultipleTimes: boolean,
    showNumberFields: boolean,
    saveFN: (data: any) => void,
  ) {
    this.activity = activity;
    this.numberIsAllowedMultipleTimes = numberIsAllowedMultipleTimes;
    this.showNumberFields = showNumberFields;
    this.saveFN = saveFN;
  }
}

import { ActivityCanvasObject } from '../../../domain/entities/activityCanvasObject';

export class ActivityDialogData {
  activity: ActivityCanvasObject;
  numberIsAllowedMultipleTimes: boolean;
  showNumberFields: boolean;

  saveFN: (data: ActivityDialogSaveData) => void;

  constructor(
    activity: ActivityCanvasObject,
    numberIsAllowedMultipleTimes: boolean,
    showNumberFields: boolean,
    saveFN: (data: ActivityDialogSaveData) => void,
  ) {
    this.activity = activity;
    this.numberIsAllowedMultipleTimes = numberIsAllowedMultipleTimes;
    this.showNumberFields = showNumberFields;
    this.saveFN = saveFN;
  }
}

export interface ActivityDialogSaveData {
  activityLabel?: string;
  activityNumber?: number;
  multipleNumbers?: boolean;
  activity: ActivityCanvasObject;
}

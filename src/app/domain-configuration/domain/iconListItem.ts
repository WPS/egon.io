import {SafeUrl} from "@angular/platform-browser";

export interface IconListItem {
  name: string,
  svg: SafeUrl,
  isActor: boolean,
  isWorkObject: boolean
}

import { LabelEntry } from './labelEntry';
import { SafeUrl } from '@angular/platform-browser';

export interface WorkObjectLabelEntry extends LabelEntry {
  icon: SafeUrl;
}

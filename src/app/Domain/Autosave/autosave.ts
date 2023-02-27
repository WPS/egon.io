import { ConfigAndDST } from '../Export/configAndDst';

export interface Autosave {
  title: string;
  description: string;
  configAndDST: ConfigAndDST;
  date: string;
}

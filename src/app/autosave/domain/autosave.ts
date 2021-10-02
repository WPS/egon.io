import { ConfigAndDST } from '../../export/domain/configAndDst';

export interface Autosave {
  configAndDST: ConfigAndDST;
  date: string;
}

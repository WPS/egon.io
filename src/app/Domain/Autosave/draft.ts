import { ConfigAndDST } from '../Export/configAndDst';

export interface Draft {
  title: string;
  description: string;
  configAndDST: ConfigAndDST;
  date: string;
}

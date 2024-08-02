import { ConfigAndDST } from '../../../Domain/Export/configAndDst';

export interface Draft {
  title: string;
  description: string;
  configAndDST: ConfigAndDST;
  date: string;
}

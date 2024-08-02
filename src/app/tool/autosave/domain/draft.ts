import { ConfigAndDST } from '../../export/domain/export/configAndDst';

export interface Draft {
  title: string;
  description: string;
  configAndDST: ConfigAndDST;
  date: string;
}

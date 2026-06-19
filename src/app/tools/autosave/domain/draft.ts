import { ConfigAndDST } from '../../export/domain/export/configAndDst';
import { Scope } from 'src/app/domain/entities/scope';

export interface Draft {
  title: string;
  description: string;
  configAndDST: ConfigAndDST;
  date: string;
  scope?: Scope;
}

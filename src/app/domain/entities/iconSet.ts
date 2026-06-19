import { Dictionary } from './dictionary';

export interface IconSet {
  name: string;
  actors: Dictionary<string>;
  workObjects: Dictionary<string>;
}

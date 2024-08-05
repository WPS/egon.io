import { CanvasObject } from 'src/app/domain/entities/common/canvasObject';
import { IMPLICIT_ROOT_ID } from './constants';

export interface RootObject {
  children: CanvasObject[];
  id: string;
}

export const testRoot: RootObject = {
  children: [],
  id: IMPLICIT_ROOT_ID,
};

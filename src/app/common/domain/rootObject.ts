import { CanvasObject } from 'src/app/common/domain/canvasObject';

export interface RootObject {
  children: CanvasObject[];
  // id is always_ __implicitroot
  id: string;
}

export const testRoot: RootObject = {
  children: [],
  id: '__implicitroot',
};

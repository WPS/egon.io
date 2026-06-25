import { CanvasObject } from 'src/app/domain/entities/canvas-object';
export interface RootObject {
  children: CanvasObject[];
  id: string;
}

export const testRoot: RootObject = {
  children: [],
  id: '__implicitroot',
};

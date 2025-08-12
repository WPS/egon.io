import { CanvasObject } from 'src/app/domain/entities/canvasObject';
export interface RootObject {
  children: CanvasObject[];
  id: string;
}

export const testRoot: RootObject = {
  children: [],
  id: '__implicitroot',
};

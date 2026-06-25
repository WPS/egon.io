import { CanvasObject } from 'src/app/domain/entities/canvas-object';

export interface DiagramJsElementRegistry {
  _elements: ElementMap;
}

export interface ElementMap {
  [key: string]: { element: CanvasObject };
}

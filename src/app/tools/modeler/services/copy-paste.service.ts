import { Injectable } from '@angular/core';
import { ElementTypes } from 'src/app/domain/entities/element-types';
import { DiagramJsEventBus } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-event-bus';
import { EVENT_ELEMENT_CHANGED } from 'src/app/tools/modeler/diagram-js/features/diagramJSConstants';

@Injectable({
  providedIn: 'root',
})
export class CopyPasteService {
  private eventBus: DiagramJsEventBus | undefined;

  private pasteColor: string[] = [];
  private pasteText: string[] = [];
  private pasteHeight: number[] = [];

  public setModelerContext(eventBus: DiagramJsEventBus) {
    this.eventBus = eventBus;
  }

  public pasteElement(event: any) {
    this.pasteColor.push(event.descriptor.oldBusinessObject.pickedColor);
    if (
      event.descriptor.oldBusinessObject.type.includes(
        ElementTypes.TEXTANNOTATION,
      )
    ) {
      this.pasteText.push(event.descriptor.oldBusinessObject.text ?? '');
      this.pasteHeight.push(event.descriptor.oldBusinessObject.height);
    }
  }

  public createEnd(event: any) {
    if (!this.pasteColor) {
      return;
    }
    for (let elementsKey in event.elements) {
      const element = event.elements[elementsKey];
      if (element.businessObject.type.includes(ElementTypes.TEXTANNOTATION)) {
        element.businessObject.text = this.pasteText[0];
        element.businessObject.number = this.pasteHeight[0];
        element.businessObject.height = this.pasteHeight[0];
        this.pasteText.shift();
        this.pasteHeight.shift();
      }
      element.businessObject.pickedColor =
        this.pasteColor[parseInt(elementsKey)];
      this.eventBus!.fire(EVENT_ELEMENT_CHANGED, { element });
    }
    this.pasteColor = [];
    this.pasteText = [];
    this.pasteHeight = [];
  }
}

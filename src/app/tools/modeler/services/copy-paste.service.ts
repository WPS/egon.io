import { Injectable } from '@angular/core';
import { ElementTypes } from 'src/app/domain/entities/elementTypes';

@Injectable({
  providedIn: 'root',
})
export class CopyPasteService {
  private eventBus: any;

  private pasteColor: string[] = [];
  private pasteText: string[] = [];
  private pasteHeight: number[] = [];

  public setModelerContext(eventBus: any) {
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
      this.eventBus.fire('element.changed', { element });
    }
    this.pasteColor = [];
    this.pasteText = [];
    this.pasteHeight = [];
  }
}

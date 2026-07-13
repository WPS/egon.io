import { TestBed } from '@angular/core/testing';

import { CopyPasteService } from './copy-paste.service';
import { ElementTypes } from 'src/app/domain/entities/element-types';
import { EVENT_ELEMENT_CHANGED } from 'src/app/tools/modeler/diagram-js/features/diagramJSConstants';

describe('CopyPasteService', () => {
  let service: CopyPasteService;
  let eventBus: { fire: jest.Mock };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CopyPasteService);
    eventBus = { fire: jest.fn() };
    service.setModelerContext(eventBus as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('pasteElement should stash color for a plain element', () => {
    service.pasteElement({
      descriptor: {
        oldBusinessObject: { type: ElementTypes.ACTOR, pickedColor: '#222' },
      },
    });

    // Only color is stashed; a subsequent createEnd applies it.
    const element = {
      businessObject: { type: ElementTypes.ACTOR },
    } as any;
    service.createEnd({ elements: { '0': element } });

    expect(element.businessObject.pickedColor).toBe('#222');
    expect(eventBus.fire).toHaveBeenCalledWith(EVENT_ELEMENT_CHANGED, {
      element,
    });
  });

  it('pasteElement should stash text and height for a text annotation', () => {
    service.pasteElement({
      descriptor: {
        oldBusinessObject: {
          type: ElementTypes.TEXTANNOTATION,
          pickedColor: '#111',
          text: 'hello',
          height: 20,
        },
      },
    });
    service.pasteElement({
      descriptor: {
        oldBusinessObject: { type: ElementTypes.ACTOR, pickedColor: '#222' },
      },
    });

    const textEl = {
      businessObject: { type: ElementTypes.TEXTANNOTATION },
    } as any;
    const normalEl = { businessObject: { type: ElementTypes.ACTOR } } as any;

    service.createEnd({ elements: { '0': textEl, '1': normalEl } });

    expect(textEl.businessObject.text).toBe('hello');
    expect(textEl.businessObject.height).toBe(20);
    expect(textEl.businessObject.number).toBe(20);
    expect(textEl.businessObject.pickedColor).toBe('#111');
    expect(normalEl.businessObject.pickedColor).toBe('#222');
    expect(eventBus.fire).toHaveBeenCalledTimes(2);
  });

  it('pasteElement should default missing annotation text to an empty string', () => {
    service.pasteElement({
      descriptor: {
        oldBusinessObject: {
          type: ElementTypes.TEXTANNOTATION,
          pickedColor: '#111',
          height: 10,
        },
      },
    });

    const textEl = {
      businessObject: { type: ElementTypes.TEXTANNOTATION },
    } as any;
    service.createEnd({ elements: { '0': textEl } });

    expect(textEl.businessObject.text).toBe('');
  });

  it('createEnd should clear the stashes between paste operations', () => {
    service.pasteElement({
      descriptor: {
        oldBusinessObject: { type: ElementTypes.ACTOR, pickedColor: '#222' },
      },
    });
    service.createEnd({
      elements: { '0': { businessObject: { type: ElementTypes.ACTOR } } },
    });

    eventBus.fire.mockClear();
    const secondElement = {
      businessObject: { type: ElementTypes.ACTOR },
    } as any;
    service.createEnd({ elements: { '0': secondElement } });

    // stashes were cleared, so no stale color is applied
    expect(secondElement.businessObject.pickedColor).toBeUndefined();
    expect(eventBus.fire).toHaveBeenCalledTimes(1);
  });
});

import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';

import { DomManipulationService } from 'src/app/tools/replay/services/dom-manipulation.service';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { preBuildTestStory } from '../../../utils/test-helpers';
import { BusinessObject } from 'src/app/domain/entities/business-object';
import { ActivityCanvasObject } from 'src/app/domain/entities/activity-canvas-object';
import { ElementTypes } from 'src/app/domain/entities/element-types';
import {
  DISPLAY_BLOCK,
  HIGHLIGHT_STROKE_WIDTH,
  STROKE_WIDTH,
} from '../domain/replayConstants';

describe('DomManipulationService', () => {
  let domManipulationService: DomManipulationService;
  let elementRegistryServiceSpy: jest.Mocked<ElementRegistryService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(ElementRegistryService)],
    });
    domManipulationService = TestBed.inject(DomManipulationService);
    elementRegistryServiceSpy = TestBed.inject(
      ElementRegistryService,
    ) as jest.Mocked<ElementRegistryService>;

    elementRegistryServiceSpy.getAllConnections.mockReturnValue([]);
    elementRegistryServiceSpy.getAllActivities.mockReturnValue([]);
    elementRegistryServiceSpy.getAllGroups.mockReturnValue([]);
    elementRegistryServiceSpy.getAllCanvasObjects.mockReturnValue([]);
    elementRegistryServiceSpy.getAllBusinessObjectsFromCanvasNotIn.mockReturnValue(
      [],
    );
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  /** Builds the DOM shape the service walks: a wrapper carrying the
   * data-element-id, containing a <path> plus label / number siblings. */
  function buildActivityDom(id: string): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-element-id', id);
    const inner = document.createElement('div');
    const path = document.createElement('path');
    const label = document.createElement('text');
    label.className = 'djs-label';
    const circle = document.createElement('rect');
    const number = document.createElement('text');
    number.className = 'djs-labelNumber';
    inner.append(path, label, circle, number);
    wrapper.appendChild(inner);
    document.body.appendChild(wrapper);
    return path;
  }

  function activityCanvasObject(id: string): ActivityCanvasObject {
    return {
      id,
      type: ElementTypes.ACTIVITY,
      businessObject: { id, pickedColor: undefined },
    } as ActivityCanvasObject;
  }

  it('should be created', () => {
    expect(domManipulationService).toBeTruthy();
  });

  it('showAll queries the registry for every element type', () => {
    domManipulationService.showAll();

    expect(elementRegistryServiceSpy.getAllCanvasObjects).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllActivities).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllGroups).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllConnections).toHaveBeenCalled();
  });

  it('showAll displays every canvas element that has a matching dom node', () => {
    buildActivityDom('e1');
    elementRegistryServiceSpy.getAllCanvasObjects.mockReturnValue([
      { businessObject: { id: 'e1' } } as any,
    ]);

    domManipulationService.showAll();

    const dom = document.querySelector('[data-element-id=e1]') as HTMLElement;
    expect(dom.style.display).toBe(DISPLAY_BLOCK);
  });

  it('showAll resets highlighting on activities to the default stroke', () => {
    const path = buildActivityDom('act1');
    elementRegistryServiceSpy.getAllActivities.mockReturnValue([
      activityCanvasObject('act1'),
    ]);

    domManipulationService.showAll();

    expect(path.style.stroke).toBe('black');
    expect(path.style.strokeWidth).toBe(STROKE_WIDTH);
  });

  it('showAll resets highlighting on connections to the default stroke', () => {
    const path = buildActivityDom('con1');
    elementRegistryServiceSpy.getAllConnections.mockReturnValue([
      activityCanvasObject('con1'),
    ]);

    domManipulationService.showAll();

    expect(path.style.stroke).toBe('black');
    expect(path.style.strokeWidth).toBe(STROKE_WIDTH);
  });

  it('showSentence highlights the activities of the sentence', () => {
    const path = buildActivityDom('act1');
    const activityBO = {
      id: 'act1',
      type: ElementTypes.ACTIVITY,
    } as BusinessObject;

    domManipulationService.showSentence({
      objects: [activityBO],
      highlightedObjects: ['act1'],
    } as any);

    expect(path.style.strokeWidth).toBe(HIGHLIGHT_STROKE_WIDTH);
    const dom = document.querySelector('[data-element-id=act1]') as HTMLElement;
    expect(dom.style.display).toBe(DISPLAY_BLOCK);
  });

  it('showSentence works with the pre-built test story', () => {
    domManipulationService.showSentence(
      preBuildTestStory(2).storyWithGroups[1],
    );

    expect(
      elementRegistryServiceSpy.getAllBusinessObjectsFromCanvasNotIn,
    ).toHaveBeenCalled();
  });

  it('getRenderedNumbers ignores numbers inside the minimap', () => {
    const canvasNumber = document.createElement('div');
    canvasNumber.className = 'djs-labelNumber';
    document.body.appendChild(canvasNumber);

    const minimap = document.createElement('div');
    minimap.className = 'djs-minimap';
    const minimapNumber = document.createElement('div');
    minimapNumber.className = 'djs-labelNumber';
    minimap.appendChild(minimapNumber);
    document.body.appendChild(minimap);

    const rendered = domManipulationService.getRenderedNumbers();

    expect(rendered).toEqual([canvasNumber]);
  });
});

import { TestBed } from '@angular/core/testing';
import { MockProviders } from 'ng-mocks';
import { DomainStoryStepBuilderService } from './domain-story-step-builder.service';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { ElementTypes } from 'src/app/domain/entities/element-types';
import { testCanvasObject } from 'src/app/domain/entities/canvas-object';
import { testActivityCanvasObject } from 'src/app/domain/entities/activity-canvas-object';
import { ActivityCanvasObject } from 'src/app/domain/entities/activity-canvas-object';
import { CanvasObject } from 'src/app/domain/entities/canvas-object';
import { BusinessObject } from 'src/app/domain/entities/business-object';
import { ActivityBusinessObject } from 'src/app/domain/entities/activity-business-object';

function makeCanvasObject(
  overrides: Partial<Omit<CanvasObject, 'businessObject'>> & {
    businessObject?: Partial<BusinessObject>;
  },
): CanvasObject {
  return {
    ...testCanvasObject,
    ...overrides,
    businessObject: {
      ...testCanvasObject.businessObject,
      ...(overrides.businessObject ?? {}),
    },
  } as CanvasObject;
}

function makeActivity(
  overrides: Partial<Omit<ActivityCanvasObject, 'businessObject'>> & {
    businessObject?: Partial<ActivityBusinessObject>;
  },
): ActivityCanvasObject {
  return {
    ...testActivityCanvasObject,
    ...overrides,
    businessObject: {
      ...testActivityCanvasObject.businessObject,
      ...(overrides.businessObject ?? {}),
    },
  } as ActivityCanvasObject;
}

describe('DomainStoryStepBuilderService', () => {
  let service: DomainStoryStepBuilderService;
  let elementRegistryService: ElementRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProviders(ElementRegistryService)],
    });
    service = TestBed.inject(DomainStoryStepBuilderService);
    elementRegistryService = TestBed.inject(ElementRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('builds a step from a simple actor -> activity -> workobject chain', () => {
    const actor = makeCanvasObject({
      id: 'actor1',
      type: ElementTypes.ACTOR,
      businessObject: { name: 'Customer' },
      outgoing: [],
      incoming: [],
    });
    const workObject = makeCanvasObject({
      id: 'wo1',
      type: ElementTypes.WORKOBJECT,
      businessObject: { name: 'Order' },
      outgoing: [],
      incoming: [],
    });
    const activity = makeActivity({
      id: 'act1',
      source: actor,
      target: workObject,
      businessObject: { number: 1, name: 'places' },
    });

    spyOn(elementRegistryService, 'getActivitiesFromActors').and.returnValue([
      activity,
    ]);

    const result = service.build();

    expect(result.steps).toEqual([
      {
        stepNumber: 1,
        stepParts: ['Customer', 'places', 'Order'],
        annotations: [],
      },
    ]);
    expect(result.actors).toEqual(new Set(['Customer']));
    expect(result.workObjects).toEqual(new Set(['Order']));
  });

  it('collects text-annotation lines attached to the target work object', () => {
    const actor = makeCanvasObject({
      id: 'actor1',
      type: ElementTypes.ACTOR,
      businessObject: { name: 'Customer' },
      outgoing: [],
      incoming: [],
    });
    const annotation = makeCanvasObject({
      id: 'note1',
      type: ElementTypes.TEXTANNOTATION,
      businessObject: { name: '' } as any,
    });
    (annotation.businessObject as any).text = 'must be paid within 30 days';
    const workObject = makeCanvasObject({
      id: 'wo1',
      type: ElementTypes.WORKOBJECT,
      businessObject: { name: 'Order' },
      outgoing: [
        {
          ...testActivityCanvasObject,
          businessObject: {
            ...testActivityCanvasObject.businessObject,
            number: undefined,
          },
          target: annotation,
        } as ActivityCanvasObject,
      ],
      incoming: [],
    });
    const activity = makeActivity({
      id: 'act1',
      source: actor,
      target: workObject,
      businessObject: { number: 1, name: 'places' },
    });

    spyOn(elementRegistryService, 'getActivitiesFromActors').and.returnValue([
      activity,
    ]);

    const result = service.build();

    expect(result.steps[0].annotations).toEqual([
      { elementName: 'Order', lines: ['must be paid within 30 days'] },
    ]);
  });
});

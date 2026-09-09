import { TestBed } from '@angular/core/testing';
import { MockProviders } from 'ng-mocks';

import { MassNamingService } from 'src/app/tools/label-dictionary/services/mass-naming.service';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { CommandStackService } from 'src/app/tools/modeler/services/command-stack.service';
import {
  CanvasObject,
  testCanvasObject,
} from 'src/app/domain/entities/canvas-object';
import { ElementTypes } from 'src/app/domain/entities/element-types';

describe('MassNamingService', () => {
  let service: MassNamingService;
  let elementRegistryService: ElementRegistryService;
  let commandStackServiceSpy: jest.Mocked<CommandStackService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProviders(CommandStackService)],
    });
    elementRegistryService = TestBed.inject(ElementRegistryService);
    commandStackServiceSpy = TestBed.inject(
      CommandStackService,
    ) as jest.Mocked<CommandStackService>;
    service = TestBed.inject(MassNamingService);
  });

  function makeCanvasObject(
    id: string,
    type: string,
    name: string,
  ): CanvasObject {
    const element = structuredClone(testCanvasObject);
    element.id = id;
    element.type = type;
    element.name = name;
    element.businessObject.name = name;
    element.businessObject.type = type;
    return element;
  }

  function populateRegistry(objects: CanvasObject[]) {
    const elements: { [key: string]: { element: CanvasObject } } = {};
    objects.forEach((object) => {
      elements[object.id] = { element: object };
    });
    elementRegistryService.setElementRegistry({ _elements: elements });
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should rename all matching objects of the given type', () => {
    populateRegistry([
      makeCanvasObject('w1', ElementTypes.WORKOBJECT, 'foo'),
      makeCanvasObject('w2', ElementTypes.WORKOBJECT, 'foo'),
      makeCanvasObject('w3', ElementTypes.WORKOBJECT, 'bar'),
    ]);

    service.massChangeNames('foo', 'baz', ElementTypes.WORKOBJECT);

    expect(commandStackServiceSpy.execute).toHaveBeenCalledTimes(1);
    const [action, context] = commandStackServiceSpy.execute.mock.calls[0];
    expect(action).toBe('domainStoryObjects.massRename');
    expect(context.newValue).toBe('baz');
    expect(context.elements.map((e: CanvasObject) => e.id)).toEqual([
      'w1',
      'w2',
    ]);
  });

  it('should not match objects of a different type with the same name', () => {
    populateRegistry([
      makeCanvasObject('a1', ElementTypes.ACTOR, 'foo'),
      makeCanvasObject('w1', ElementTypes.WORKOBJECT, 'foo'),
    ]);

    service.massChangeNames('foo', 'baz', ElementTypes.WORKOBJECT);

    const [, context] = commandStackServiceSpy.execute.mock.calls[0];
    expect(context.elements.map((e: CanvasObject) => e.id)).toEqual(['w1']);
  });

  it('should execute with an empty element list when nothing matches', () => {
    populateRegistry([makeCanvasObject('w1', ElementTypes.WORKOBJECT, 'foo')]);

    service.massChangeNames('doesNotExist', 'baz', ElementTypes.WORKOBJECT);

    const [, context] = commandStackServiceSpy.execute.mock.calls[0];
    expect(context.elements).toEqual([]);
  });
});

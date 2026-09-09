import { TestBed } from '@angular/core/testing';

import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import {
  ActivityCanvasObject,
  testActivityCanvasObject,
} from 'src/app/domain/entities/activity-canvas-object';
import {
  CanvasObject,
  testCanvasObject,
} from 'src/app/domain/entities/canvas-object';
import {
  GroupCanvasObject,
  testGroupCanvasObject,
} from 'src/app/domain/entities/group-canvas-object';
import { ElementTypes } from 'src/app/domain/entities/element-types';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import {
  MatButtonToggle,
  MatButtonToggleModule,
} from '@angular/material/button-toggle';
import { MockProviders } from 'ng-mocks';
import { DiagramJsElementRegistry } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-element-registry';

function resetRegistry(
  registry: DiagramJsElementRegistry,
  testActivity: ActivityCanvasObject,
  testActor: CanvasObject,
  testWorkObject: CanvasObject,
  testGroup: GroupCanvasObject,
  testConnection: ActivityCanvasObject,
) {
  registry._elements = {};
  registry._elements[testActivity.name] = {
    element: structuredClone(testActivity),
  };
  registry._elements[testActor.name] = { element: structuredClone(testActor) };
  registry._elements[testWorkObject.name] = {
    element: structuredClone(testWorkObject),
  };
  registry._elements[testGroup.name] = { element: structuredClone(testGroup) };

  registry._elements[testConnection.name] = {
    element: structuredClone(testConnection),
  };
}

describe('ElementRegistryService', () => {
  let service: ElementRegistryService;
  let registry: DiagramJsElementRegistry;

  let testActivity: ActivityCanvasObject;
  let testActor: CanvasObject;
  let testWorkObject: CanvasObject;
  let testGroup: GroupCanvasObject;
  let testConnection: ActivityCanvasObject;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatToolbarModule, MatButtonToggleModule],
      providers: [MockProviders(MatButtonToggle, MatToolbar)],
    });
    service = TestBed.inject(ElementRegistryService);

    registry = {
      _elements: {},
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  beforeEach(() => {
    testActor = structuredClone(testCanvasObject);
    testActor.type = ElementTypes.ACTOR;
    testActor.businessObject.type = ElementTypes.ACTOR;
    testActor.name = 'actor';

    testActivity = structuredClone(testActivityCanvasObject);
    testActivity.source = testActor;
    testActivity.name = 'activity';

    testWorkObject = structuredClone(testCanvasObject);
    testWorkObject.name = 'workObject';

    testGroup = structuredClone(testGroupCanvasObject);
    testGroup.name = 'group';
    testGroup.children?.push(structuredClone(testGroupCanvasObject));

    testConnection = structuredClone(testActivityCanvasObject);
    testConnection.name = 'connection';
    testConnection.type = ElementTypes.CONNECTION;
    testConnection.businessObject.type = ElementTypes.CONNECTION;
  });

  describe('createObjectListForDSTDownload', () => {
    beforeEach(() => {
      resetRegistry(
        registry,
        testActivity,
        testActor,
        testWorkObject,
        testGroup,
        testConnection,
      );
    });

    it('should return empty if registry not correctly initialized', () => {
      service.setElementRegistry({ _elements: {} });
      const objectListForDSTDownload = service.createObjectListForDSTDownload();
      expect(objectListForDSTDownload).toEqual([]);
    });

    it('should return objectList', () => {
      service.setElementRegistry(registry);

      const objectListForDSTDownload = service.createObjectListForDSTDownload();
      expect(objectListForDSTDownload).toContainEqual(testActivity);
      expect(objectListForDSTDownload).toContainEqual(testActor);
      expect(objectListForDSTDownload).toContainEqual(testWorkObject);
      expect(objectListForDSTDownload).toContainEqual(testGroup);

      service.clear();
    });
  });

  describe('getObjects', () => {
    beforeEach(() => {
      resetRegistry(
        registry,
        testActivity,
        testActor,
        testWorkObject,
        testGroup,
        testConnection,
      );
      service.setElementRegistry(registry);
    });

    it('getAllActivities', () => {
      const activities = service.getAllActivities();

      expect(activities).toContainEqual(testActivity);
    });

    it('getActivitiesFromActors', () => {
      const activities = service.getActivitiesFromActors();

      expect(activities).toContainEqual(testActivity);
    });

    it('getAllCanvasObjects', () => {
      const objects = service.getAllCanvasObjects();

      expect(objects).toContainEqual(testActivity);
      expect(objects).toContainEqual(testActor);
      expect(objects).toContainEqual(testWorkObject);
      expect(objects).toContainEqual(testConnection);
    });

    it('getAllConnections', () => {
      const connections = service.getAllConnections();

      expect(connections).toContainEqual(testConnection);
    });

    it('getAllGroups', () => {
      const groups = service.getAllGroups();

      expect(groups.length).toBe(1);
      expect(groups).toContainEqual(testGroup);
    });

    it('getAllGroups should not contain duplicates', () => {
      const groups = service.getAllGroups();

      expect(testGroup.id).toBe('test');
      expect(testGroup.children![0].id).toBe('test');
      expect(groups.length).toBe(1);
      expect(groups).toContainEqual(testGroup);
    });

    afterAll(() => {
      service.clear();
    });
  });
});

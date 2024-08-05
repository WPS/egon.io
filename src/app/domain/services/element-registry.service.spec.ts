import { TestBed } from '@angular/core/testing';

import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import {
  ActivityCanvasObject,
  testActivityCanvasObject,
} from '../entities/activityCanvasObject';
import { CanvasObject, testCanvasObject } from '../entities/canvasObject';
import {
  GroupCanvasObject,
  testGroupCanvasObject,
} from '../entities/groupCanvasObject';
import { ElementTypes } from '../entities/elementTypes';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import {
  MatButtonToggle,
  MatButtonToggleModule,
} from '@angular/material/button-toggle';
import { MockProviders } from 'ng-mocks';

function resetRegistry(
  registry: any,
  testActivity: ActivityCanvasObject,
  testActor: CanvasObject,
  testWorkobject: CanvasObject,
  testGroup: GroupCanvasObject,
  testConnection: ActivityCanvasObject,
) {
  registry._elements = [];
  registry._elements[testActivity.name] = {
    element: structuredClone(testActivity),
  };
  registry._elements[testActor.name] = { element: structuredClone(testActor) };
  registry._elements[testWorkobject.name] = {
    element: structuredClone(testWorkobject),
  };
  registry._elements[testGroup.name] = { element: structuredClone(testGroup) };
  registry._elements[testConnection.name] = {
    element: structuredClone(testConnection),
  };
}

describe('ElementRegistryService', () => {
  let service: ElementRegistryService;
  let registry: any;

  let testActivity: ActivityCanvasObject;
  let testActor: CanvasObject;
  let testWorkobject: CanvasObject;
  let testGroup: GroupCanvasObject;
  let testConnection: ActivityCanvasObject;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatToolbarModule, MatButtonToggleModule],
      providers: [MockProviders(MatButtonToggle, MatToolbar)],
    });
    service = TestBed.inject(ElementRegistryService);

    registry = {
      _elements: [],
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

    testWorkobject = structuredClone(testCanvasObject);
    testWorkobject.name = 'workobject';

    testGroup = structuredClone(testGroupCanvasObject);
    testGroup.name = 'group';

    testConnection = structuredClone(testActivityCanvasObject);
    testConnection.name = 'conntection';
    testConnection.type = ElementTypes.CONNECTION;
    testConnection.businessObject.type = ElementTypes.CONNECTION;
  });

  describe('createObjectListForDSTDownload', () => {
    beforeEach(() => {
      resetRegistry(
        registry,
        testActivity,
        testActor,
        testWorkobject,
        testGroup,
        testConnection,
      );
    });

    it('should return empty if registry not correctly initialized', () => {
      service.setElementRegistry({ _elements: [] });
      const objectListForDSTDownload = service.createObjectListForDSTDownload();
      expect(objectListForDSTDownload).toEqual([]);
    });

    it('should return objectList', () => {
      service.setElementRegistry(registry);

      const objectListForDSTDownload = service.createObjectListForDSTDownload();
      expect(objectListForDSTDownload).toContain(testActivity);
      expect(objectListForDSTDownload).toContain(testActor);
      expect(objectListForDSTDownload).toContain(testWorkobject);
      expect(objectListForDSTDownload).toContain(testGroup);

      service.clear();
    });
  });

  describe('getObjects', () => {
    beforeEach(() => {
      resetRegistry(
        registry,
        testActivity,
        testActor,
        testWorkobject,
        testGroup,
        testConnection,
      );
      service.setElementRegistry(registry);
    });

    it('getAllActivites', () => {
      const activities = service.getAllActivities();

      expect(activities).toContain(testActivity);
    });

    it('getActivitiesFromActors', () => {
      const activities = service.getActivitiesFromActors();

      expect(activities).toContain(testActivity);
    });

    it('getAllCanvasObjects', () => {
      const objects = service.getAllCanvasObjects();

      expect(objects).toContain(testActivity);
      expect(objects).toContain(testActor);
      expect(objects).toContain(testWorkobject);
      expect(objects).toContain(testConnection);
    });

    it('getAllConnections', () => {
      const connections = service.getAllConnections();

      expect(connections).toContain(testConnection);
    });

    it('getAllGroups', () => {
      const groups = service.getAllGroups();

      expect(groups).toContain(testGroup);
    });

    afterAll(() => {
      service.clear();
    });
  });
});

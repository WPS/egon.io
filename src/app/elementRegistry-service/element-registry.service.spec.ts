import { TestBed } from '@angular/core/testing';

import { ElementRegistryService } from 'src/app/elementRegistry-service/element-registry.service';
import { deepCopy } from '../common/util/deepCopy';
import {
  ActivityCanvasObject,
  testActivityCanvasObject,
} from '../common/domain/activityCanvasObject';
import { CanvasObject, testCanvasObject } from '../common/domain/canvasObject';
import {
  GroupCanvasObject,
  testGroupCanvasObject,
} from '../common/domain/groupCanvasObject';
import { elementTypes } from '../common/domain/elementTypes';

describe('ElementRegistryService', () => {
  let service: ElementRegistryService;
  let registry: any;

  let testActivity: ActivityCanvasObject;
  let testActor: CanvasObject;
  let testWorkobject: CanvasObject;
  let testGroup: GroupCanvasObject;
  let testConnection: ActivityCanvasObject;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElementRegistryService);

    registry = {
      _elements: [],
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  beforeEach(() => {
    testActor = deepCopy(testCanvasObject);
    testActor.type = elementTypes.ACTOR;
    testActor.businessObject.type = elementTypes.ACTOR;

    testActivity = deepCopy(testActivityCanvasObject);
    testActivity.source = testActor;

    testWorkobject = deepCopy(testCanvasObject);

    testGroup = deepCopy(testGroupCanvasObject);

    testConnection = deepCopy(testActivityCanvasObject);

    testConnection.type = elementTypes.CONNECTION;
    testConnection.businessObject.type = elementTypes.CONNECTION;
  });

  describe('createObjectListForDSTDownload', () => {
    beforeEach(() => {
      registry._elements = [testActivity, testActor, testWorkobject, testGroup];
    });

    it('should return empty if registry not correctly initialized', () => {
      service.init({ _elements: [] });
      const objectListForDSTDownload = service.createObjectListForDSTDownload();
      expect(objectListForDSTDownload).toEqual([]);
    });

    it('should return objectList', () => {
      service.init(registry);

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
      registry._elements = [
        testActivity,
        testActor,
        testWorkobject,
        testGroup,
        testConnection,
      ];
      service.init(registry);
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

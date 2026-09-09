import { TestBed } from '@angular/core/testing';

import { ImportRepairService } from 'src/app/tools/import/services/import-repair.service';
import { BusinessObject } from 'src/app/domain/entities/business-object';
import { ElementTypes } from 'src/app/domain/entities/element-types';

describe('ImportRepairService', () => {
  let service: ImportRepairService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportRepairService);
  });

  function bo(id: string, type: string, extra: Partial<BusinessObject> = {}) {
    return {
      id,
      name: id,
      type,
      x: 0,
      y: 0,
      height: undefined,
      width: undefined,
      pickedColor: undefined,
      ...extra,
    } as BusinessObject;
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('checkForUnreferencedElementsInActivitiesAndRepair', () => {
    it('should return true when all activities reference existing elements', () => {
      const actor = bo('1', ElementTypes.ACTOR);
      const workObject = bo('2', ElementTypes.WORKOBJECT);
      const activity = bo('a1', ElementTypes.ACTIVITY, {
        source: '1',
        target: '2',
      } as any);

      const complete =
        service.checkForUnreferencedElementsInActivitiesAndRepair([
          actor,
          workObject,
          activity,
        ]);

      expect(complete).toBe(true);
    });

    it('should return true when there are no activities or connections', () => {
      const complete =
        service.checkForUnreferencedElementsInActivitiesAndRepair([
          bo('1', ElementTypes.ACTOR),
          bo('2', ElementTypes.WORKOBJECT),
        ]);

      expect(complete).toBe(true);
    });

    it('should return false when an activity references a missing target', () => {
      const actor = bo('1', ElementTypes.ACTOR);
      const activity = bo('a1', ElementTypes.ACTIVITY, {
        source: '1',
        target: 'missing',
      } as any);

      const complete =
        service.checkForUnreferencedElementsInActivitiesAndRepair([
          actor,
          activity,
        ]);

      expect(complete).toBe(false);
    });

    it('should return false when an activity references a missing source', () => {
      const workObject = bo('2', ElementTypes.WORKOBJECT);
      const activity = bo('a1', ElementTypes.ACTIVITY, {
        source: 'missing',
        target: '2',
      } as any);

      const complete =
        service.checkForUnreferencedElementsInActivitiesAndRepair([
          workObject,
          activity,
        ]);

      expect(complete).toBe(false);
    });

    it('should treat connections like activities when checking references', () => {
      const actor = bo('1', ElementTypes.ACTOR);
      const connection = bo('c1', ElementTypes.CONNECTION, {
        source: '1',
        target: 'missing',
      } as any);

      const complete =
        service.checkForUnreferencedElementsInActivitiesAndRepair([
          actor,
          connection,
        ]);

      expect(complete).toBe(false);
    });
  });

  describe('updateCustomElementsPreviousV050', () => {
    it('should rename a plain workObject to a Document work object', () => {
      const elements = [bo('1', ElementTypes.WORKOBJECT)];

      const result = service.updateCustomElementsPreviousV050(elements);

      expect(result[0].type).toBe(ElementTypes.WORKOBJECT + 'Document');
    });

    it('should rename a Bubble work object to a Conversation work object', () => {
      const elements = [bo('1', ElementTypes.WORKOBJECT + 'Bubble')];

      const result = service.updateCustomElementsPreviousV050(elements);

      expect(result[0].type).toBe(ElementTypes.WORKOBJECT + 'Conversation');
    });

    it('should leave other element types untouched', () => {
      const elements = [bo('1', ElementTypes.ACTOR)];

      const result = service.updateCustomElementsPreviousV050(elements);

      expect(result[0].type).toBe(ElementTypes.ACTOR);
    });
  });

  describe('removeWhitespacesFromIcons', () => {
    it('should replace all whitespaces in the type with dashes', () => {
      const elements = [bo('1', ElementTypes.WORKOBJECT + 'My Cool Icon')];

      service.removeWhitespacesFromIcons(elements);

      expect(elements[0].type).toBe(ElementTypes.WORKOBJECT + 'My-Cool-Icon');
    });

    it('should not modify types without whitespace', () => {
      const elements = [bo('1', ElementTypes.ACTOR + 'Person')];

      service.removeWhitespacesFromIcons(elements);

      expect(elements[0].type).toBe(ElementTypes.ACTOR + 'Person');
    });
  });

  describe('removeUnnecessaryBpmnProperties', () => {
    it('should clear leftover bpmn properties', () => {
      const element = bo('1', ElementTypes.WORKOBJECT) as any;
      element.$type = 'bpmn:Task';
      element.$descriptor = { some: 'descriptor' };
      element.di = { some: 'di' };

      service.removeUnnecessaryBpmnProperties([element]);

      expect(element.$type).toBeUndefined();
      expect(element.$descriptor).toBeUndefined();
      expect(element.di).toBeUndefined();
    });

    it('should not fail when no bpmn properties are present', () => {
      const element = bo('1', ElementTypes.WORKOBJECT);

      expect(() =>
        service.removeUnnecessaryBpmnProperties([element]),
      ).not.toThrow();
    });
  });
});

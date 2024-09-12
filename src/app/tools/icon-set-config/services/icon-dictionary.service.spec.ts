import { TestBed } from '@angular/core/testing';

import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { defaultIconSet } from '../domain/iconConfiguration';
import { ElementTypes } from '../../../domain/entities/elementTypes';
import { INITIAL_ICON_SET_NAME } from '../../../domain/entities/constants';
import { Dictionary } from '../../../domain/entities/dictionary';
import {
  BusinessObject,
  testBusinessObject,
} from '../../../domain/entities/businessObject';
import { builtInIcons } from '../domain/allIcons';
import { IconSet } from '../../../domain/entities/iconSet';

describe('IconDictionaryService', () => {
  let service: IconDictionaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IconDictionaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initTypeDictionaries', () => {
    const actors = ['Person', 'Dollar'];
    const workObjects = ['Document', 'Gavel'];

    it('should initialize Dictionaries with default icons', () => {
      service.initTypeDictionaries([], []);

      const actorsDictionary = service.getActorsDictionary();
      const workObjectsDictionary = service.getWorkObjectsDictionary();

      expect(
        actorsDictionary
          .keysArray()
          .map((e) => e.replace(ElementTypes.ACTOR, '')),
      ).toEqual(defaultIconSet.actors);
      expect(
        workObjectsDictionary
          .keysArray()
          .map((e) => e.replace(ElementTypes.WORKOBJECT, '')),
      ).toEqual(defaultIconSet.workObjects);
    });

    it('should initialize Dictionaries with provided icons', () => {
      service.initTypeDictionaries(actors, workObjects);

      const actorsDictionary = service.getActorsDictionary();
      const workObjectsDictionary = service.getWorkObjectsDictionary();

      expect(
        actorsDictionary
          .keysArray()
          .map((e) => e.replace(ElementTypes.ACTOR, '')),
      ).toEqual(actors);
      expect(
        workObjectsDictionary
          .keysArray()
          .map((e) => e.replace(ElementTypes.WORKOBJECT, '')),
      ).toEqual(workObjects);
    });
  });

  describe('getCurrentIconConfigurationForBPMN', () => {
    it('should return default Configuration', () => {
      const configuration = service.getCurrentIconConfigurationForBPMN();
      expect(configuration.actors).toEqual(defaultIconSet.actors);
      expect(configuration.workObjects).toEqual(defaultIconSet.workObjects);
    });

    it('should return current Configuration', () => {
      const actors = new Dictionary();
      actors.add('', 'Dollar');
      const workObjects = new Dictionary();
      workObjects.add('', 'Gavel');

      const customConfig: IconSet = {
        name: INITIAL_ICON_SET_NAME,
        actors,
        workObjects,
      };
      service.setCustomConfiguration(customConfig);

      const configuration = service.getCurrentIconConfigurationForBPMN();
      expect(configuration.actors).toEqual(['Dollar']);
      expect(configuration.workObjects).toEqual(['Gavel']);
    });
  });

  describe('addIconsFromIconSetConfiguration', () => {
    it('add icons to ActorDictionary', () => {
      const type = 'Hotel';
      expect(service.getActorsDictionary().has(type)).toBeFalsy();
      service.addIconsFromIconSetConfiguration(ElementTypes.ACTOR, [type]);

      expect(service.getActorsDictionary().has(type)).toBeTruthy();
    });

    it('add icons to WorkObjectDictionary', () => {
      const type = 'Hotel';
      expect(service.getWorkObjectsDictionary().has(type)).toBeFalsy();
      service.addIconsFromIconSetConfiguration(ElementTypes.WORKOBJECT, [type]);

      expect(service.getWorkObjectsDictionary().has(type)).toBeTruthy();
    });
  });

  describe('addIconsToTypeDictionary', () => {
    it('', () => {
      const actor = structuredClone(testBusinessObject);
      actor.type = ElementTypes.ACTOR + 'Hotel';

      const workObject = structuredClone(testBusinessObject);
      workObject.type = ElementTypes.WORKOBJECT + 'Dining';

      service.addIconsToTypeDictionary([actor], [workObject]);

      expect(service.getActorsDictionary().has('Hotel')).toBeTruthy();
      expect(service.getWorkObjectsDictionary().has('Dining')).toBeTruthy();
    });
  });

  describe('registerIconForType', () => {
    it('register Icon for WorkObjects', () => {
      service.registerIconForType(
        ElementTypes.WORKOBJECT,
        'Hotel',
        builtInIcons['Hotel'],
      );

      expect(service.getWorkObjectsDictionary().has('Hotel')).toBeTruthy();
    });

    it('register Icon for Actors', () => {
      service.registerIconForType(
        ElementTypes.ACTOR,
        'Hotel',
        builtInIcons['Hotel'],
      );

      expect(service.getActorsDictionary().has('Hotel')).toBeTruthy();
    });
  });

  describe('updateIconRegistries', () => {
    const actor = structuredClone(testBusinessObject);
    actor.type = ElementTypes.ACTOR + 'Person';

    const workObject = structuredClone(testBusinessObject);
    workObject.type = ElementTypes.WORKOBJECT + 'Document';

    const actors: BusinessObject[] = [actor];
    const workObjects: BusinessObject[] = [workObject];

    const actorsDict = new Dictionary();
    const workObjectsDict = new Dictionary();

    actorsDict.add(actor, 'TestCustomActor');
    workObjectsDict.add(workObject, 'TestCustomWorkObject');

    const config: IconSet = {
      name: INITIAL_ICON_SET_NAME,
      actors: actorsDict,
      workObjects: workObjectsDict,
    };

    it('With elements and Config', () => {
      service.updateIconRegistries(actors, workObjects, config);

      expect(service.getActorsDictionary().keysArray()).toContain('Person');
      expect(service.getCustomIconsDictionary().keysArray()).toContain(
        'TestCustomActor',
      );

      expect(service.getWorkObjectsDictionary().keysArray()).toContain(
        'Document',
      );
      expect(service.getCustomIconsDictionary().keysArray()).toContain(
        'TestCustomWorkObject',
      );
    });
  });
});

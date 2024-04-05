import { TestBed } from '@angular/core/testing';

import { IconDictionaryService } from 'src/app/Service/DomainConfiguration/icon-dictionary.service';
import { defaultConf } from '../../Domain/Common/iconConfiguration';
import { elementTypes } from '../../Domain/Common/elementTypes';
import { DomainConfiguration } from '../../Domain/Common/domainConfiguration';
import { INITIAL_DOMAIN_NAME } from '../../Domain/Common/constants';
import { Dictionary } from '../../Domain/Common/dictionary/dictionary';
import {
  BusinessObject,
  testBusinessObject,
} from '../../Domain/Common/businessObject';
import { allIcons } from '../../Domain/Domain-Configuration/allIcons';

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
          .map((e) => e.replace(elementTypes.ACTOR, ''))
      ).toEqual(defaultConf.actors);
      expect(
        workObjectsDictionary
          .keysArray()
          .map((e) => e.replace(elementTypes.WORKOBJECT, ''))
      ).toEqual(defaultConf.workObjects);
    });

    it('should initialize Dictionaries with provided icons', () => {
      service.initTypeDictionaries(actors, workObjects);

      const actorsDictionary = service.getActorsDictionary();
      const workObjectsDictionary = service.getWorkObjectsDictionary();

      expect(
        actorsDictionary
          .keysArray()
          .map((e) => e.replace(elementTypes.ACTOR, ''))
      ).toEqual(actors);
      expect(
        workObjectsDictionary
          .keysArray()
          .map((e) => e.replace(elementTypes.WORKOBJECT, ''))
      ).toEqual(workObjects);
    });
  });

  describe('getCurrentIconConfigurationForBPMN', () => {
    it('should return default Configuration', () => {
      const configuration = service.getCurrentIconConfigurationForBPMN();
      expect(configuration.actors).toEqual(defaultConf.actors);
      expect(configuration.workObjects).toEqual(defaultConf.workObjects);
    });

    it('should return current Configuration', () => {
      const actors = new Dictionary();
      actors.add('', 'Dollar');
      const workObjects = new Dictionary();
      workObjects.add('', 'Gavel');

      const customConfig: DomainConfiguration = {
        name: INITIAL_DOMAIN_NAME,
        actors,
        workObjects,
      };
      service.setCustomConfiguration(customConfig);

      const configuration = service.getCurrentIconConfigurationForBPMN();
      expect(configuration.actors).toEqual(['Dollar']);
      expect(configuration.workObjects).toEqual(['Gavel']);
    });
  });

  describe('addIconsFromDomainConfiguration', () => {
    it('add icons to ActorDictionary', () => {
      const type = 'Hotel';
      expect(service.getActorsDictionary().has(type)).toBeFalsy();
      service.addIconsFromDomainConfiguration(elementTypes.ACTOR, [type]);

      expect(service.getActorsDictionary().has(type)).toBeTruthy();
    });

    it('add icons to WorkObjectDictionary', () => {
      const type = 'Hotel';
      expect(service.getWorkObjectsDictionary().has(type)).toBeFalsy();
      service.addIconsFromDomainConfiguration(elementTypes.WORKOBJECT, [type]);

      expect(service.getWorkObjectsDictionary().has(type)).toBeTruthy();
    });
  });

  describe('addIconsToTypeDictionary', () => {
    it('', () => {
      const actor = structuredClone(testBusinessObject);
      actor.type = elementTypes.ACTOR + 'Hotel';

      const workObject = structuredClone(testBusinessObject);
      workObject.type = elementTypes.WORKOBJECT + 'Dining';

      service.addIconsToTypeDictionary([actor], [workObject]);

      expect(service.getActorsDictionary().has('Hotel')).toBeTruthy();
      expect(service.getWorkObjectsDictionary().has('Dining')).toBeTruthy();
    });
  });

  describe('registerIconForType', () => {
    it('register Icon for WorkObjects', () => {
      service.registerIconForType(
        elementTypes.WORKOBJECT,
        'Hotel',
        allIcons['Hotel']
      );

      expect(service.getWorkObjectsDictionary().has('Hotel')).toBeTruthy();
    });

    it('register Icon for Actors', () => {
      service.registerIconForType(
        elementTypes.ACTOR,
        'Hotel',
        allIcons['Hotel']
      );

      expect(service.getActorsDictionary().has('Hotel')).toBeTruthy();
    });
  });

  describe('updateIconRegistries', () => {
    const actor = structuredClone(testBusinessObject);
    actor.type = elementTypes.ACTOR + 'Person';

    const workObject = structuredClone(testBusinessObject);
    workObject.type = elementTypes.WORKOBJECT + 'Document';

    const actors: BusinessObject[] = [actor];
    const workObjects: BusinessObject[] = [workObject];

    const actorsDict = new Dictionary();
    const workObjectsDict = new Dictionary();

    actorsDict.add(actor, 'TestCustomActor');
    workObjectsDict.add(workObject, 'TestCustomWorkObject');

    const config: DomainConfiguration = {
      name: INITIAL_DOMAIN_NAME,
      actors: actorsDict,
      workObjects: workObjectsDict,
    };

    it('With elements and Config', () => {
      service.updateIconRegistries(actors, workObjects, config);

      expect(service.getActorsDictionary().keysArray()).toContain('Person');
      expect(service.getAppendedIconDictionary().keysArray()).toContain(
        'TestCustomActor'
      );

      expect(service.getWorkObjectsDictionary().keysArray()).toContain(
        'Document'
      );
      expect(service.getAppendedIconDictionary().keysArray()).toContain(
        'TestCustomWorkObject'
      );
    });
  });
});

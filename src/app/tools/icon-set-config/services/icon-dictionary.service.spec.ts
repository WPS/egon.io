import { TestBed } from '@angular/core/testing';

import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { ElementTypes } from '../../../domain/entities/elementTypes';
import { INITIAL_ICON_SET_NAME } from '../../../domain/entities/constants';
import { Dictionary } from '../../../domain/entities/dictionary';
import { builtInIcons } from '../domain/builtInIcons';
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
    it('should initialize Dictionaries with default icon set', () => {
      service.initTypeDictionaries();

      const actorsDictionary = service.getIconsAssignedAs(ElementTypes.ACTOR);
      const workObjectsDictionary = service.getIconsAssignedAs(
        ElementTypes.WORKOBJECT,
      );

      expect(
        actorsDictionary
          .keysArray()
          .map((e) => e.replace(ElementTypes.ACTOR, '')),
      ).toEqual(['Person', 'Group', 'System']);
      expect(
        workObjectsDictionary
          .keysArray()
          .map((e) => e.replace(ElementTypes.WORKOBJECT, '')),
      ).toEqual([
        'Document',
        'Folder',
        'Call',
        'Email',
        'Conversation',
        'Info',
      ]);
    });

    it('should initialize Dictionaries with customized icon set', () => {
      const actorType = 'Dollar';
      const workObjectType = 'Gavel';

      const actorsDict = new Dictionary<string>();
      const workObjectsDict = new Dictionary<string>();

      actorsDict.set(actorType, ElementTypes.ACTOR + actorType);
      workObjectsDict.set(
        workObjectType,
        ElementTypes.WORKOBJECT + workObjectType,
      );

      const customizedIconSet: IconSet = {
        name: INITIAL_ICON_SET_NAME,
        actors: actorsDict,
        workObjects: workObjectsDict,
      };

      service.setIconSet(customizedIconSet);
      service.initTypeDictionaries();

      const actorsDictionary = service.getIconsAssignedAs(ElementTypes.ACTOR);
      const workObjectsDictionary = service.getIconsAssignedAs(
        ElementTypes.WORKOBJECT,
      );

      expect(actorsDictionary.keysArray).toEqual(actorsDict.keysArray);
      expect(workObjectsDictionary.keysArray).toEqual(
        workObjectsDict.keysArray,
      );
    });
  });

  describe('registerIconForType', () => {
    it('register Icon for WorkObjects', () => {
      service.registerIconForType(
        ElementTypes.WORKOBJECT,
        'Hotel',
        builtInIcons.get('Hotel'),
      );

      expect(
        service.getIconsAssignedAs(ElementTypes.WORKOBJECT).has('Hotel'),
      ).toBeTruthy();
    });

    it('register Icon for Actors', () => {
      service.registerIconForType(
        ElementTypes.ACTOR,
        'Hotel',
        builtInIcons.get('Hotel'),
      );

      expect(
        service.getIconsAssignedAs(ElementTypes.ACTOR).has('Hotel'),
      ).toBeTruthy();
    });
  });

  describe('updateIconRegistries', () => {
    const actorsDict = new Dictionary<string>();
    const workObjectsDict = new Dictionary<string>();

    actorsDict.set('TestCustomActor', 'svg1');
    workObjectsDict.set('TestCustomWorkObject', 'svg2');

    const config: IconSet = {
      name: INITIAL_ICON_SET_NAME,
      actors: actorsDict,
      workObjects: workObjectsDict,
    };

    it('from IconSet file', () => {
      expect(
        service.getIconsAssignedAs(ElementTypes.ACTOR).isEmpty(),
      ).toBeTrue();
      expect(
        service.getIconsAssignedAs(ElementTypes.WORKOBJECT).isEmpty(),
      ).toBeTrue();

      service.updateIconRegistries(config);

      expect(
        service.getIconsAssignedAs(ElementTypes.ACTOR).has('Person'),
      ).toBeFalse();
      expect(service.getFullDictionary().keysArray()).toContain(
        'TestCustomActor',
      );
      expect(service.getFullDictionary().keysArray()).toContain(
        'TestCustomWorkObject',
      );

      service.updateIconRegistries(service.getDefaultIconSet());
    });
  });
});

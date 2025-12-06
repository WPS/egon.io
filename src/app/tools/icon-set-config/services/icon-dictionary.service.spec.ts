import { TestBed } from '@angular/core/testing';

import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { ElementTypes } from '../../../domain/entities/elementTypes';
import { INITIAL_ICON_SET_NAME } from '../../../domain/entities/constants';
import { Dictionary } from '../../../domain/entities/dictionary';
import { testBusinessObject } from '../../../domain/entities/businessObject';
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

      const actorsDictionary = service.getActorsDictionary();
      const workObjectsDictionary = service.getWorkObjectsDictionary();

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
      const actor = structuredClone(testBusinessObject);
      actor.type = ElementTypes.ACTOR + 'Dollar';

      const workObject = structuredClone(testBusinessObject);
      workObject.type = ElementTypes.WORKOBJECT + 'Gavel';

      const actorsDict = new Dictionary();
      const workObjectsDict = new Dictionary();

      actorsDict.add(actor, 'Dollar');
      workObjectsDict.add(workObject, 'Gavel');

      const customizedIconSet: IconSet = {
        name: INITIAL_ICON_SET_NAME,
        actors: actorsDict,
        workObjects: workObjectsDict,
      };

      service.setIconSet(customizedIconSet);
      service.initTypeDictionaries();

      const actorsDictionary = service.getActorsDictionary();
      const workObjectsDictionary = service.getWorkObjectsDictionary();

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

      expect(service.getWorkObjectsDictionary().has('Hotel')).toBeTruthy();
    });

    it('register Icon for Actors', () => {
      service.registerIconForType(
        ElementTypes.ACTOR,
        'Hotel',
        builtInIcons.get('Hotel'),
      );

      expect(service.getActorsDictionary().has('Hotel')).toBeTruthy();
    });
  });

  describe('updateIconRegistries', () => {
    const actorsDict = new Dictionary();
    const workObjectsDict = new Dictionary();

    actorsDict.add('svg1', 'TestCustomActor');
    workObjectsDict.add('svg2', 'TestCustomWorkObject');

    const config: IconSet = {
      name: INITIAL_ICON_SET_NAME,
      actors: actorsDict,
      workObjects: workObjectsDict,
    };

    it('from iconset file', () => {
      expect(service.getActorsDictionary().isEmpty());
      expect(service.getWorkObjectsDictionary().isEmpty());

      service.updateIconRegistries(config);

      expect(service.getActorsDictionary().has('Person')).toBeFalse;
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

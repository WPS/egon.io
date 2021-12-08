import { TestBed } from '@angular/core/testing';

import { IconDictionaryService } from 'src/app/Service/DomainConfiguration/icon-dictionary.service';
import { defaultConf } from '../../Domain/Common/iconConfiguration';
import { elementTypes } from '../../Domain/Common/elementTypes';
import {
  CustomDomainCofiguration,
  DomainConfiguration,
} from '../../Domain/Common/domainConfiguration';
import { INITIAL_DOMAIN_NAME } from '../../Domain/Common/constants';
import { Dictionary } from '../../Domain/Common/dictionary/dictionary';

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
      service.setCusomtConfiguration(customConfig);

      const configuration = service.getCurrentIconConfigurationForBPMN();
      expect(configuration.actors).toEqual(['Dollar']);
      expect(configuration.workObjects).toEqual(['Gavel']);
    });
  });
});

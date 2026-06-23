import { TestBed } from '@angular/core/testing';

import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import {
  INITIAL_DESCRIPTION,
  INITIAL_TITLE,
} from '../../../domain/entities/constants';
import { environment } from '../../../../environments/environment';

describe(PropertiesService.name, () => {
  let service: PropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getVersion', () => {
    expect(service.getVersion()).toEqual(environment.version);
  });

  it('should initialize title and Description', () => {
    expect(service.getDescription()).toEqual(INITIAL_DESCRIPTION);
    expect(service.getTitle()).toEqual(INITIAL_TITLE);
  });

  // allowUndo is untestable due to it is interaction with the commandStack
  // implicitly tests updateTitle & updateDescription
  describe('updateTitleAndDescription', () => {
    it('should update title', () => {
      service.updateTitleAndDescriptionAndScope(
        'title',
        null,
        undefined,
        false,
      );

      expect(service.getTitle()).toEqual('title');
      expect(service.getDescription()).toEqual(INITIAL_DESCRIPTION);

      expect(service.title()).toEqual('title');
      expect(service.description()).toEqual(INITIAL_DESCRIPTION);
    });

    it('should update description', () => {
      service.updateTitleAndDescriptionAndScope(
        null,
        'description',
        undefined,
        false,
      );

      expect(service.getTitle()).toEqual(INITIAL_TITLE);
      expect(service.getDescription()).toEqual('description');

      expect(service.title()).toEqual(INITIAL_TITLE);
      expect(service.description()).toEqual('description');
    });

    it('should update title and description', () => {
      service.updateTitleAndDescriptionAndScope(
        'title',
        'description',
        undefined,
        false,
      );

      expect(service.getTitle()).toEqual('title');
      expect(service.getDescription()).toEqual('description');

      expect(service.title()).toEqual('title');
      expect(service.description()).toEqual('description');
    });
  });
});

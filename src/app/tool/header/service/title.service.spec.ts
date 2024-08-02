import { TestBed } from '@angular/core/testing';

import { TitleService } from 'src/app/tool/header/service/title.service';
import {
  INITIAL_DESCRIPTION,
  INITIAL_TITLE,
} from '../../../domain/entity/common/constants';
import { environment } from '../../../../environments/environment';

describe(TitleService.name, () => {
  let service: TitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getVerision', () => {
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
      service.updateTitleAndDescription('title', null, false);

      expect(service.getTitle()).toEqual('title');
      expect(service.getDescription()).toEqual(INITIAL_DESCRIPTION);

      service.title$.subscribe((value) => expect(value).toEqual('title'));
      service.description$.subscribe((value) =>
        expect(value).toEqual(INITIAL_DESCRIPTION),
      );
    });

    it('should update description', () => {
      service.updateTitleAndDescription(null, 'description', false);

      expect(service.getTitle()).toEqual(INITIAL_TITLE);
      expect(service.getDescription()).toEqual('description');

      service.title$.subscribe((value) => expect(value).toEqual(INITIAL_TITLE));
      service.description$.subscribe((value) =>
        expect(value).toEqual('description'),
      );
    });

    it('should update title and description', () => {
      service.updateTitleAndDescription('title', 'description', false);

      expect(service.getTitle()).toEqual('title');
      expect(service.getDescription()).toEqual('description');

      service.title$.subscribe((value) => expect(value).toEqual('title'));
      service.description$.subscribe((value) =>
        expect(value).toEqual('description'),
      );
    });
  });
});

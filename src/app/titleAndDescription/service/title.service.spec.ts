import { TestBed } from '@angular/core/testing';
// @ts-ignore
import { version } from '../../../../package.json';

import {
  initialTitle,
  TitleService,
} from 'src/app/titleAndDescription/service/title.service';

describe('TitleService', () => {
  let service: TitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getVerision', () => {
    expect(service.getVersion()).toEqual(version);
  });

  it('should initialize title and Description', () => {
    expect(service.getDescription()).toEqual('');
    expect(service.getTitle()).toEqual(initialTitle);
  });

  // allowUndo is untestable due to it's interaction with the commandStack
  // implicitly tests updateTitle & updateDescription
  describe('updateTitleAndDescription', () => {
    it('should update title', () => {
      service.updateTitleAndDescription('title', null, false);

      expect(service.getTitle()).toEqual('title');
      expect(service.getDescription()).toEqual('');

      service
        .getTitleObservable()
        .subscribe((value) => expect(value).toEqual('title'));
      service
        .getDescriptionObservable()
        .subscribe((value) => expect(value).toEqual(''));
    });

    it('should update description', () => {
      service.updateTitleAndDescription(null, 'description', false);

      expect(service.getTitle()).toEqual(initialTitle);
      expect(service.getDescription()).toEqual('description');

      service
        .getTitleObservable()
        .subscribe((value) => expect(value).toEqual(initialTitle));
      service
        .getDescriptionObservable()
        .subscribe((value) => expect(value).toEqual('description'));
    });

    it('should update title and description', () => {
      service.updateTitleAndDescription('title', 'description', false);

      expect(service.getTitle()).toEqual('title');
      expect(service.getDescription()).toEqual('description');

      service
        .getTitleObservable()
        .subscribe((value) => expect(value).toEqual('title'));
      service
        .getDescriptionObservable()
        .subscribe((value) => expect(value).toEqual('description'));
    });
  });
});

import {TestBed} from '@angular/core/testing';

import {TitleService,} from 'src/app/Service/Title/title.service';
import {INITIAL_TITLE, VERSION} from "../../Domain/Common/constants";

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
    expect(service.getVersion()).toEqual(VERSION);
  });

  it('should initialize title and Description', () => {
    expect(service.getDescription()).toEqual('');
    expect(service.getTitle()).toEqual(INITIAL_TITLE);
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

      expect(service.getTitle()).toEqual(INITIAL_TITLE);
      expect(service.getDescription()).toEqual('description');

      service
        .getTitleObservable()
        .subscribe((value) => expect(value).toEqual(INITIAL_TITLE));
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

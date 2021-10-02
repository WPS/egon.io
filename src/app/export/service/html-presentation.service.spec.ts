import { TestBed } from '@angular/core/testing';

import { HtmlPresentationService } from './html-presentation.service';
import { MockService } from 'ng-mocks';
import { DomManipulationService } from '../../domManipulation/service/dom-manipulation.service';
import { ElementRegistryService } from '../../elementRegistry-service/element-registry.service';
import { ReplayStateService } from '../../replay-service/replay-state.service';
import { DialogService } from '../../dialog/service/dialog.service';
import { StoryCreatorService } from '../../storyCreator-service/story-creator.service';

describe('HtmlPresentationService', () => {
  let service: HtmlPresentationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DomManipulationService,
          useValue: MockService(DomManipulationService),
        },
        {
          provide: ElementRegistryService,
          useValue: MockService(ElementRegistryService),
        },
        {
          provide: ReplayStateService,
          useValue: MockService(ReplayStateService),
        },
        {
          provide: DialogService,
          useValue: MockService(DialogService),
        },
        {
          provide: StoryCreatorService,
          useValue: MockService(StoryCreatorService),
        },
      ],
    });
    service = TestBed.inject(HtmlPresentationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

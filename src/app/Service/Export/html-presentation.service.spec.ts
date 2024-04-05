import { TestBed } from '@angular/core/testing';

import { HtmlPresentationService } from './html-presentation.service';
import { MockProviders } from 'ng-mocks';
import { ElementRegistryService } from '../ElementRegistry/element-registry.service';
import { DialogService } from '../Dialog/dialog.service';
import { StoryCreatorService } from '../Replay/storyCreator/story-creator.service';
import { ReplayService } from '../Replay/replay.service';
import { TitleService } from '../Title/title.service';

describe('HtmlPresentationService', () => {
  let service: HtmlPresentationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProviders(
          ElementRegistryService,
          DialogService,
          StoryCreatorService,
          ReplayService,
          TitleService,
        ),
      ],
    });
    service = TestBed.inject(HtmlPresentationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { HtmlPresentationService } from './html-presentation.service';
import { MockProviders } from 'ng-mocks';
import { ElementRegistryService } from '../../../Service/ElementRegistry/element-registry.service';
import { DialogService } from '../../../Service/Dialog/dialog.service';
import { StoryCreatorService } from '../../replay/service/replay/story-creator.service';
import { ReplayService } from '../../replay/service/replay/replay.service';
import { TitleService } from '../../header/service/title.service';

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

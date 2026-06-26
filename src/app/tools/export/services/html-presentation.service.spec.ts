import { TestBed } from '@angular/core/testing';

import { HtmlPresentationService } from './html-presentation.service';
import { MockProviders } from 'ng-mocks';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { DialogService } from 'src/app/tools/dialog/services/dialog.service';
import { StoryCreatorService } from '../../replay/services/story-creator.service';
import { ReplayService } from '../../replay/services/replay.service';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';

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
          PropertiesService,
        ),
      ],
    });
    service = TestBed.inject(HtmlPresentationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

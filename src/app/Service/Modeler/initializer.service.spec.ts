import { TestBed } from '@angular/core/testing';

import { InitializerService } from './initializer.service';
import { DirtyFlagService } from '../DirtyFlag/dirty-flag.service';
import { IconDictionaryService } from '../DomainConfiguration/icon-dictionary.service';
import { ElementRegistryService } from '../ElementRegistry/element-registry.service';
import { DomainConfigurationService } from '../DomainConfiguration/domain-configuration.service';
import { LabelDictionaryService } from '../LabelDictionary/label-dictionary.service';
import { ReplayStateService } from '../Replay/replay-state.service';
import { DialogService } from '../Dialog/dialog.service';
import { TitleService } from '../Title/title.service';
import { MassNamingService } from '../LabelDictionary/mass-naming.service';
import { HtmlPresentationService } from '../Export/html-presentation.service';
import { MockService } from 'ng-mocks';

describe('InitializerService', () => {
  let service: InitializerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DirtyFlagService,
        },
        {
          provide: IconDictionaryService,
          useValue: MockService(IconDictionaryService),
        },
        {
          provide: ElementRegistryService,
          useValue: MockService(ElementRegistryService),
        },
        {
          provide: DomainConfigurationService,
          useValue: MockService(DomainConfigurationService),
        },
        {
          provide: LabelDictionaryService,
          useValue: MockService(LabelDictionaryService),
        },
        {
          provide: DialogService,
          useValue: MockService(DialogService),
        },
        {
          provide: HtmlPresentationService,
          useValue: MockService(HtmlPresentationService),
        },
        {
          provide: MassNamingService,
          useValue: MockService(MassNamingService),
        },
        {
          provide: ReplayStateService,
          useValue: MockService(ReplayStateService),
        },
        TitleService,
      ],
    });
    service = TestBed.inject(InitializerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

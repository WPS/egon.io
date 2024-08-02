import { TestBed } from '@angular/core/testing';

import { InitializerService } from './initializer.service';
import { DirtyFlagService } from '../../../Service/DirtyFlag/dirty-flag.service';
import { IconDictionaryService } from '../../../Service/IconSetConfiguration/icon-dictionary.service';
import { ElementRegistryService } from '../../../Service/ElementRegistry/element-registry.service';
import { IconSetConfigurationService } from '../../../Service/IconSetConfiguration/icon-set-configuration.service';
import { LabelDictionaryService } from '../../../Service/LabelDictionary/label-dictionary.service';
import { ReplayStateService } from '../../../Service/Replay/replay-state.service';
import { DialogService } from '../../../Service/Dialog/dialog.service';
import { TitleService } from '../../../Service/Title/title.service';
import { MassNamingService } from '../../../Service/LabelDictionary/mass-naming.service';
import { HtmlPresentationService } from '../../../tool/export/service/html-presentation.service';
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
          provide: IconSetConfigurationService,
          useValue: MockService(IconSetConfigurationService),
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

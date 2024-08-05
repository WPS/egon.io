import { TestBed } from '@angular/core/testing';

import { InitializerService } from './initializer.service';
import { DirtyFlagService } from '../../../domain/services/dirty-flag.service';
import { IconDictionaryService } from '../../icon-set-config/services/icon-dictionary.service';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';
import { IconSetConfigurationService } from '../../icon-set-config/services/icon-set-configuration.service';
import { LabelDictionaryService } from '../../label-dictionary/services/label-dictionary.service';
import { ReplayStateService } from '../../replay/services/replay-state.service';
import { DialogService } from '../../../domain/services/dialog.service';
import { TitleService } from '../../header/services/title.service';
import { MassNamingService } from '../../label-dictionary/services/mass-naming.service';
import { HtmlPresentationService } from '../../export/services/html-presentation.service';
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

import { TestBed } from '@angular/core/testing';

import { InitializerService } from './initializer.service';
import { DirtyFlagService } from '../../dirtyFlag-service/dirty-flag.service';
import { IconDictionaryService } from '../../domain-configuration/service/icon-dictionary.service';
import { ElementRegistryService } from '../../elementRegistry-service/element-registry.service';
import { DomainConfigurationService } from '../../domain-configuration/service/domain-configuration.service';
import { LabelDictionaryService } from '../../label-dictionary/service/label-dictionary.service';
import { ReplayStateService } from '../../replay-service/replay-state.service';
import { DialogService } from '../../dialog/service/dialog.service';
import { TitleService } from '../../titleAndDescription/service/title.service';
import { MassNamingService } from '../../label-dictionary/service/mass-naming.service';
import { HtmlPresentationService } from '../../export/service/html-presentation.service';
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

import { TestBed } from '@angular/core/testing';

import { InitializerService } from './initializer.service';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';
import { DialogService } from '../../../domain/services/dialog.service';
import { TitleService } from '../../header/services/title.service';
import { MassNamingService } from '../../label-dictionary/services/mass-naming.service';
import { HtmlPresentationService } from '../../export/services/html-presentation.service';
import { MockService } from 'ng-mocks';
import { ReplayService } from '../../replay/services/replay.service';

describe('InitializerService', () => {
  let service: InitializerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ElementRegistryService,
          useValue: MockService(ElementRegistryService),
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
          provide: ReplayService,
          useValue: MockService(ReplayService),
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

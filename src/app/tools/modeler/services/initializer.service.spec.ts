import { TestBed } from '@angular/core/testing';

import { InitializerService } from './initializer.service';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { DialogService } from 'src/app/tools/dialog/services/dialog.service';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
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
        PropertiesService,
      ],
    });
    service = TestBed.inject(InitializerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

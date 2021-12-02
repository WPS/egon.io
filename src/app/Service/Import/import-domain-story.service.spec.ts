import {TestBed} from '@angular/core/testing';

import {ImportDomainStoryService} from 'src/app/Service/Import/import-domain-story.service';
import {ElementRegistryService} from '../ElementRegistry/element-registry.service';
import {IconDictionaryService} from '../DomainConfiguration/icon-dictionary.service';
import {DirtyFlagService} from '../DirtyFlag/dirty-flag.service';
import {ImportRepairService} from './import-repair.service';
import {TitleService} from '../Title/title.service';
import {RendererService} from '../Renderer/renderer.service';
import {MockService} from 'ng-mocks';
import {DialogService} from '../Dialog/dialog.service';

describe('ImportDomainStoryService', () => {
  let service: ImportDomainStoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ElementRegistryService,
          useValue: MockService(ElementRegistryService),
        },
        {
          provide: IconDictionaryService,
          useValue: MockService(IconDictionaryService),
        },
        {
          provide: DirtyFlagService,
        },
        {
          provide: ImportRepairService,
          useValue: MockService(ImportRepairService),
        },
        {
          provide: TitleService,
        },
        {
          provide: RendererService,
          useValue: MockService(RendererService),
        },
        {
          provide: DialogService,
          useValue: MockService(DialogService),
        },
      ],
    });
    service = TestBed.inject(ImportDomainStoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

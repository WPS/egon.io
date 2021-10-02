import { TestBed } from '@angular/core/testing';

import { ImportDomainStoryService } from 'src/app/import-service/import-domain-story.service';
import { ElementRegistryService } from '../elementRegistry-service/element-registry.service';
import { IconDictionaryService } from '../domain-configuration/service/icon-dictionary.service';
import { DirtyFlagService } from '../dirtyFlag-service/dirty-flag.service';
import { ImportRepairService } from './import-repair.service';
import { TitleService } from '../titleAndDescription/service/title.service';
import { RendererService } from '../renderer-service/renderer.service';
import { MockService } from 'ng-mocks';
import { DialogService } from '../dialog/service/dialog.service';

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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from 'src/app/header/component/header.component';
import { TitleService } from '../../titleAndDescription/service/title.service';
import { MockService } from 'ng-mocks';
import { ReplayService } from '../../replay-service/replay.service';
import { ImportDomainStoryService } from '../../import-service/import-domain-story.service';
import { ExportService } from '../../export/service/export.service';
import { ModelerService } from '../../modeler/service/modeler.service';
import { ElementRegistryService } from '../../elementRegistry-service/element-registry.service';
import { DialogService } from '../../dialog/service/dialog.service';
import { SettingsService } from '../../settings-module/service/settings.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        {
          provide: TitleService,
        },
        {
          provide: ReplayService,
          useValue: MockService(ReplayService),
        },
        {
          provide: ImportDomainStoryService,
          useValue: MockService(ImportDomainStoryService),
        },
        {
          provide: ExportService,
          useValue: MockService(ExportService),
        },
        {
          provide: ModelerService,
          useValue: MockService(ModelerService),
        },
        {
          provide: ElementRegistryService,
          useValue: MockService(ElementRegistryService),
        },
        {
          provide: DialogService,
          useValue: MockService(DialogService),
        },
        {
          provide: SettingsService,
          useValue: MockService(SettingsService),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

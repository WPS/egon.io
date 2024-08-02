import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from 'src/app/Presentation/Header/header.component';
import { TitleService } from '../../Service/Title/title.service';
import { MockComponent, MockModule, MockService } from 'ng-mocks';
import { ReplayService } from '../../Service/Replay/replay.service';
import { ImportDomainStoryService } from '../../tool/import/service/import-domain-story.service';
import { ExportService } from '../../tool/export/service/export.service';
import { ModelerService } from '../../Service/Modeler/modeler.service';
import { ElementRegistryService } from '../../Service/ElementRegistry/element-registry.service';
import { DialogService } from '../../Service/Dialog/dialog.service';
import { SettingsService } from '../../workbench/service/settings/settings.service';
import { HeaderButtonsComponent } from '../../workbench/presentation/header/header-buttons/header-buttons.component';
import { MaterialModule } from 'src/app/material.module';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [HeaderComponent, MockComponent(HeaderButtonsComponent)],
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

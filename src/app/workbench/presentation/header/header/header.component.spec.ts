import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from 'src/app/workbench/presentation/header/header/header.component';
import { TitleService } from '../../../../tools/header/services/title.service';
import { MockComponent, MockModule, MockService } from 'ng-mocks';
import { ReplayService } from '../../../../tools/replay/services/replay.service';
import { ImportDomainStoryService } from '../../../../tools/import/services/import-domain-story.service';
import { ExportService } from '../../../../tools/export/services/export.service';
import { ModelerService } from '../../../../tools/modeler/services/modeler.service';
import { ElementRegistryService } from '../../../../domain/services/element-registry.service';
import { DialogService } from '../../../../domain/services/dialog.service';
import { SettingsService } from '../../../services/settings/settings.service';
import { HeaderButtonsComponent } from '../header-buttons/header-buttons.component';
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

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HeaderComponent} from 'src/app/Presentation/Header/header.component';
import {TitleService} from '../../Service/Title/title.service';
import {MockService} from 'ng-mocks';
import {ReplayService} from '../../Service/Replay/replay.service';
import {ImportDomainStoryService} from '../../Service/Import/import-domain-story.service';
import {ExportService} from '../../Service/Export/export.service';
import {ModelerService} from '../../Service/Modeler/modeler.service';
import {ElementRegistryService} from '../../Service/ElementRegistry/element-registry.service';
import {DialogService} from '../../Service/Dialog/dialog.service';
import {SettingsService} from '../../Service/Settings/settings.service';

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

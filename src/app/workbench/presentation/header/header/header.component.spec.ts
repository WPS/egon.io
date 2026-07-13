import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { MockProvider, MockService } from 'ng-mocks';
import { ReplayService } from '../../../../tools/replay/services/replay.service';
import { ImportDomainStoryService } from '../../../../tools/import/services/import-domain-story.service';
import { ExportService } from '../../../../tools/export/services/export.service';
import { ModelerService } from '../../../../tools/modeler/services/modeler.service';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { SettingsService } from '../../../services/settings/settings.service';
import { HeaderComponent } from './header.component';
import { signal } from '@angular/core';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],

      providers: [
        {
          provide: PropertiesService,
        },
        MockProvider(ReplayService, {
          replayOn: signal(false),
          currentSentence: signal(1),
          maxSentenceNumber: signal(2),
          showGroups: signal(false),
          hasGroups: signal(false),
        }),
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

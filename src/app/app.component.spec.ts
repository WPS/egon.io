import { TestBed } from '@angular/core/testing';
import { AppComponent } from 'src/app/app.component';
import { MockComponent, MockProvider, MockProviders } from 'ng-mocks';
import { SettingsService } from './workbench/services/settings/settings.service';
import { TitleService } from './tools/title/services/title.service';
import { ExportService } from './tools/export/services/export.service';
import { ReplayService } from 'src/app/tools/replay/services/replay.service';
import { AutosaveService } from './tools/autosave/services/autosave.service';
import { ColorPickerDirective } from 'ngx-color-picker';
import { HeaderComponent } from './workbench/presentation/header/header/header.component';
import { ImportDomainStoryService } from './tools/import/services/import-domain-story.service';
import { DirtyFlagService } from './domain/services/dirty-flag.service';
import { ModelerService } from './tools/modeler/services/modeler.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs/internal/observable/of';
import { Observable } from 'rxjs/internal/Observable';
import { IconSet } from 'src/app/domain/entities/iconSet';

describe('AppComponent', () => {
  let autosaveService: jasmine.SpyObj<AutosaveService>;

  beforeEach(async () => {
    autosaveService = jasmine.createSpyObj('autosaveService', [
      'loadLatestDraft',
    ]);
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        MockComponent(HeaderComponent),
        ColorPickerDirective,
      ],
      providers: [
        MockProviders(
          SettingsService,
          TitleService,
          ExportService,
          ReplayService,
          DirtyFlagService,
          ModelerService,
        ),
        MockProvider(ImportDomainStoryService, {
          automatedImportSuccessFull(): Observable<void> {
            return of();
          },
        }),
        {
          provide: AutosaveService,
          useValue: autosaveService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({ get: () => null }),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should load latest draft', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(autosaveService.loadLatestDraft).toHaveBeenCalled();
  });
});

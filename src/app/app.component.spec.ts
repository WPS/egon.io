import { TestBed } from '@angular/core/testing';
import { AppComponent } from 'src/app/app.component';
import { MockComponent, MockProviders } from 'ng-mocks';
import { SettingsService } from './workbench/services/settings/settings.service';
import { TitleService } from './tools/title/services/title.service';
import { ExportService } from './tools/export/services/export.service';
import { ReplayService } from 'src/app/tools/replay/services/replay.service';
import { AutosaveService } from './tools/autosave/services/autosave.service';
import { ColorPickerDirective } from 'ngx-color-picker';
import { HeaderComponent } from './workbench/presentation/header/header/header.component';

describe('AppComponent', () => {
  let autosaveService: jasmine.SpyObj<AutosaveService>;

  beforeEach(async () => {
    autosaveService = jasmine.createSpyObj('autosaveService', [
      'loadLatestDraft',
    ]);
    await TestBed.configureTestingModule({
      declarations: [AppComponent, MockComponent(HeaderComponent)],
      providers: [
        MockProviders(
          SettingsService,
          TitleService,
          ExportService,
          ReplayService,
        ),
        {
          provide: AutosaveService,
          useValue: autosaveService,
        },
      ],
      imports: [ColorPickerDirective],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
  // TODO: fix flakey test
  // it('should load latest draft', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   expect(autosaveService.loadLatestDraft).toHaveBeenCalled();
  // });
});

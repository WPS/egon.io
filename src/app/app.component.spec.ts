import { TestBed } from '@angular/core/testing';
import { AppComponent } from 'src/app/app.component';
import { MockComponent, MockProviders } from 'ng-mocks';
import { SettingsService } from './workbench/services/settings/settings.service';
import { TitleService } from './tools/header/services/title.service';
import { ExportService } from './tools/export/services/export.service';
import { ModelerComponent } from './tools/modeler/presentation/modeler/modeler.component';
import { HeaderComponent } from './tools/header/presentation/header/header.component';
import { ReplayService } from 'src/app/tools/replay/services/replay.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MockComponent(ModelerComponent),
        MockComponent(HeaderComponent),
      ],
      providers: [
        MockProviders(
          SettingsService,
          TitleService,
          ExportService,
          ReplayService,
        ),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

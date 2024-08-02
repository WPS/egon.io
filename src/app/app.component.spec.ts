import { TestBed } from '@angular/core/testing';
import { AppComponent } from 'src/app/app.component';
import { MockComponent, MockProviders } from 'ng-mocks';
import { SettingsService } from './workbench/service/settings/settings.service';
import { TitleService } from './tool/header/service/title.service';
import { ExportService } from './tool/export/service/export.service';
import { ModelerComponent } from './tool/modeler/presentation/modeler/modeler.component';
import { HeaderComponent } from './tool/header/presentation/header/header.component';
import { ReplayService } from 'src/app/tool/replay/service/replay.service';

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

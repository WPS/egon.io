import { TestBed } from '@angular/core/testing';
import { AppComponent } from 'src/app/workbench/app.component';
import { MockComponent, MockProviders } from 'ng-mocks';
import { SettingsService } from './service/settings/settings.service';
import { TitleService } from '../tool/header/service/title.service';
import { ExportService } from '../tool/export/service/export.service';
import { ModelerComponent } from '../Presentation/Canvas/modeler.component';
import { HeaderComponent } from '../tool/header/presentation/header/header.component';
import { ReplayService } from 'src/app/Service/Replay/replay.service';

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

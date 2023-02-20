import { TestBed } from '@angular/core/testing';
import { AppComponent } from 'src/app/app.component';
import { MockComponent, MockProviders } from 'ng-mocks';
import { SettingsService } from './Service/Settings/settings.service';
import { DialogService } from './Service/Dialog/dialog.service';
import { TitleService } from './Service/Title/title.service';
import { ExportService } from './Service/Export/export.service';
import { ModelerComponent } from './Presentation/Canvas/modeler.component';
import { HeaderComponent } from './Presentation/Header/header.component';
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
          DialogService,
          SettingsService,
          TitleService,
          ExportService,
          ReplayService
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

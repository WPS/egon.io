import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from 'src/app/app.component';
import { MockProviders } from 'ng-mocks';
import { SettingsService } from './Service/Settings/settings.service';
import { DialogService } from './Service/Dialog/dialog.service';
import { TitleService } from './Service/Title/title.service';
import { ExportService } from './Service/Export/export.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        MockProviders(
          DialogService,
          SettingsService,
          TitleService,
          ExportService
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

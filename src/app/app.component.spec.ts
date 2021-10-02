import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from 'src/app/app.component';
import { MockService } from 'ng-mocks';
import { SettingsService } from './settings-module/service/settings.service';
import { DialogService } from './dialog/service/dialog.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        {
          provide: SettingsService,
          useValue: MockService(SettingsService),
        },
        {
          provide: DialogService,
          useValue: MockService(DialogService),
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

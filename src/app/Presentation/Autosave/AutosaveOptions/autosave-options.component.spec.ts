import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutosaveOptionsComponent } from './autosave-options.component';
import { MockModule, MockProviders } from 'ng-mocks';
import { AutosaveConfigurationService } from '../../../Service/Autosave/autosave-configuration.service';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsModule } from 'src/app/Modules/settings.module';

describe('AutosaveOptionsComponent', () => {
  let component: AutosaveOptionsComponent;
  let fixture: ComponentFixture<AutosaveOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule), MockModule(SettingsModule)],
      declarations: [AutosaveOptionsComponent],
      providers: [
        {
          provide: AutosaveConfigurationService,
        },
        MockProviders(MatSnackBar)
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutosaveOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

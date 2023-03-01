import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutosaveOptionsComponent } from './autosave-options.component';
import { MockModule, MockProviders } from 'ng-mocks';
import { AutosaveStateService } from '../../Service/Autosave/autosave-state.service';
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
          provide: AutosaveStateService,
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

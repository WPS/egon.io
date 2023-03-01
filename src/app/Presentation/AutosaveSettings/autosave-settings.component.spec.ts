import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutosaveSettingsComponent } from './autosave-settings.component';
import { MockModule, MockProviders, MockService } from 'ng-mocks';
import { AutosaveService } from '../../Service/Autosave/autosave.service';
import { AutosaveStateService } from '../../Service/Autosave/autosave-state.service';
import { MaterialModule } from 'src/app/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('AutosaveSettingsComponent', () => {
  let component: AutosaveSettingsComponent;
  let fixture: ComponentFixture<AutosaveSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [AutosaveSettingsComponent],
      providers: [
        {
          provide: AutosaveService,
          useValue: MockService(AutosaveService),
        },
        {
          provide: AutosaveStateService,
        },
        MockProviders(MatSnackBar),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutosaveSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

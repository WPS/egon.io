import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutosaveSettingsComponent } from './autosave-settings.component';
import { MockModule, MockService } from 'ng-mocks';
import { AutosaveService } from '../../Service/Autosave/autosave.service';
import { AutosaveStateService } from '../../Service/Autosave/autosave-state.service';
import { MaterialModule } from 'src/app/material.module';

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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeneralSettingsComponent } from './general-settings.component';
import { AutosaveSettingsComponent } from '../../../../tool/autosave/presentation/AutosaveSettings/autosave-settings.component';
import { MockComponent } from 'ng-mocks';

describe('GeneralSettingsComponent', () => {
  let component: GeneralSettingsComponent;
  let fixture: ComponentFixture<GeneralSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        GeneralSettingsComponent,
        MockComponent(AutosaveSettingsComponent),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

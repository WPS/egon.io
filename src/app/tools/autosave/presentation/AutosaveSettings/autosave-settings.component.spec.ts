import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutosaveSettingsComponent } from './autosave-settings.component';
import { MockModule } from 'ng-mocks';
import { AutosaveModule } from '../autosave.module';

describe('AutosaveSettingsComponent', () => {
  let component: AutosaveSettingsComponent;
  let fixture: ComponentFixture<AutosaveSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(AutosaveModule)],
      declarations: [AutosaveSettingsComponent],
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

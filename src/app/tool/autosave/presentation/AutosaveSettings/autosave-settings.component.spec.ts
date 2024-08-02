import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutosaveSettingsComponent } from './autosave-settings.component';
import { MockModule } from 'ng-mocks';
import { SettingsModule } from 'src/app/workbench/presentation/settings/settings.module';

describe('AutosaveSettingsComponent', () => {
  let component: AutosaveSettingsComponent;
  let fixture: ComponentFixture<AutosaveSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(SettingsModule)],
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

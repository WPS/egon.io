import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SettingsComponent} from 'src/app/Presentation/Settings/settings.component';
import {SettingsService} from '../../Service/Settings/settings.service';
import {MockProviders} from 'ng-mocks';
import {ModelerService} from '../../Service/Modeler/modeler.service';
import {AutosaveStateService} from "../../Service/Autosave/autosave-state.service";
import {DomainCustomizationService} from "../../Service/DomainConfiguration/domain-customization.service";

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [
        MockProviders(
          SettingsService,
          ModelerService,
          AutosaveStateService,
          DomainCustomizationService)
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

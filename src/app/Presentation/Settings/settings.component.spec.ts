import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from 'src/app/Presentation/Settings/settings.component';
import { SettingsService } from '../../Service/Settings/settings.service';
import { MockComponent, MockProviders } from 'ng-mocks';
import { ModelerService } from '../../Service/Modeler/modeler.service';
import { AutosaveStateService } from '../../Service/Autosave/autosave-state.service';
import { DomainCustomizationService } from '../../Service/DomainConfiguration/domain-customization.service';
import { DomainConfigurationComponent } from '../DomainConfiguration/domain-configuration.component';
import { MatToolbarModule } from '@angular/material/toolbar';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatToolbarModule],
      declarations: [
        SettingsComponent,
        MockComponent(DomainConfigurationComponent),
      ],
      providers: [
        MockProviders(
          SettingsService,
          ModelerService,
          AutosaveStateService,
          DomainCustomizationService
        ),
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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from 'src/app/Presentation/Settings/settings.component';
import { SettingsService } from '../../workbench/service/settings/settings.service';
import { MockComponent, MockProviders } from 'ng-mocks';
import { ModelerService } from '../../tool/modeler/service/modeler.service';
import { AutosaveConfigurationService } from '../../tool/autosave/service/autosave-configuration.service';
import { IconSetCustomizationService } from '../../Service/IconSetConfiguration/icon-set-customization.service';
import { IconSetConfigurationComponent } from '../IconSetConfiguration/icon-set-configuration.component';
import { MatToolbarModule } from '@angular/material/toolbar';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatToolbarModule],
      declarations: [
        SettingsComponent,
        MockComponent(IconSetConfigurationComponent),
      ],
      providers: [
        MockProviders(
          SettingsService,
          ModelerService,
          AutosaveConfigurationService,
          IconSetCustomizationService,
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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from 'src/app/workbench/presentation/settings/settings.component';
import { SettingsService } from '../../services/settings/settings.service';
import { MockProviders } from 'ng-mocks';
import { ModelerService } from '../../../tools/modeler/services/modeler.service';
import { AutosaveConfigurationService } from '../../../tools/autosave/services/autosave-configuration.service';
import { IconSetCustomizationService } from '../../../tools/icon-set-config/services/icon-set-customization.service';
import { MatToolbarModule } from '@angular/material/toolbar';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatToolbarModule, SettingsComponent],
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

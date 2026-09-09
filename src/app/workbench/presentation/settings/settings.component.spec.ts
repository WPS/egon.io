import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from 'src/app/workbench/presentation/settings/settings.component';
import { SettingsService } from '../../services/settings/settings.service';
import { MockProvider, MockProviders } from 'ng-mocks';
import { ModelerService } from '../../../tools/modeler/services/modeler.service';
import { AutosaveConfigurationService } from '../../../tools/autosave/services/autosave-configuration.service';
import { IconSetCustomizationService } from '../../../tools/icon-set-config/services/icon-set-customization.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { signal } from '@angular/core';

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
        ),
        MockProvider(IconSetCustomizationService, {
          selectedActorsSignal: signal([]),
          selectedWorkObjectsSignal: signal([]),
        }),
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

  it('close should restart the modeler with a saved configuration when present', () => {
    const iconSetCustomization = TestBed.inject(
      IconSetCustomizationService,
    ) as jest.Mocked<IconSetCustomizationService>;
    const modelerService = TestBed.inject(
      ModelerService,
    ) as jest.Mocked<ModelerService>;
    const settingsService = TestBed.inject(
      SettingsService,
    ) as jest.Mocked<SettingsService>;
    const config = { name: 'saved' } as any;
    iconSetCustomization.getAndClearSavedConfiguration.mockReturnValue(config);

    (component as any).close();

    expect(modelerService.restart).toHaveBeenCalledWith(config);
    expect(settingsService.close).toHaveBeenCalled();
  });

  it('close should just close when there is no saved configuration', () => {
    const iconSetCustomization = TestBed.inject(
      IconSetCustomizationService,
    ) as jest.Mocked<IconSetCustomizationService>;
    const modelerService = TestBed.inject(
      ModelerService,
    ) as jest.Mocked<ModelerService>;
    const settingsService = TestBed.inject(
      SettingsService,
    ) as jest.Mocked<SettingsService>;
    iconSetCustomization.getAndClearSavedConfiguration.mockReturnValue(
      undefined as any,
    );

    (component as any).close();

    expect(modelerService.restart).not.toHaveBeenCalled();
    expect(settingsService.close).toHaveBeenCalled();
  });

  it('openGeneralSettings should show the autosave settings', () => {
    component.openGeneralSettings();

    expect(component.showAutosaveSettings()).toBe(true);
    expect(component.showIconSetCustomization()).toBe(false);
  });

  it('openIconSetCustomization should show the icon set customization', () => {
    component.openGeneralSettings();
    component.openIconSetCustomization();

    expect(component.showAutosaveSettings()).toBe(false);
    expect(component.showIconSetCustomization()).toBe(true);
  });
});

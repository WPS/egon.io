import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSetConfigurationComponent } from 'src/app/tools/icon-set-config/presentation/icon-set-configuration/icon-set-configuration.component';
import { MockModule, MockProvider, MockProviders } from 'ng-mocks';
import { IconSetImportExportService } from '../../services/icon-set-import-export.service';
import { IconDictionaryService } from '../../services/icon-dictionary.service';
import { IconSetCustomizationService } from '../../services/icon-set-customization.service';
import { BehaviorSubject } from 'rxjs';
import { IconSetDetailsComponent } from '../icon-set-details/icon-set-details.component';
import { MaterialModule } from 'src/app/material.module';
import { CustomIconSetConfiguration } from '../../../../domain/entities/custom-icon-set-configuration';
import { INITIAL_ICON_SET_NAME } from '../../../../domain/entities/constants';
import { Dictionary } from '../../../../domain/entities/dictionary';

describe(IconSetConfigurationComponent.name, () => {
  let component: IconSetConfigurationComponent;
  let fixture: ComponentFixture<IconSetConfigurationComponent>;

  beforeEach(async () => {
    const testCustomIconSetConfiguration: CustomIconSetConfiguration = {
      name: INITIAL_ICON_SET_NAME,
      actors: ['Person'],
      workObjects: ['Document'],
    };

    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [IconSetConfigurationComponent, IconSetDetailsComponent],
      providers: [
        MockProviders(IconSetImportExportService),
        MockProvider(IconDictionaryService, {
          getFullDictionary(): Dictionary {
            return new Dictionary();
          },
        }),
        MockProvider(IconSetCustomizationService, {
          getIconSetConfiguration(): BehaviorSubject<CustomIconSetConfiguration> {
            return new BehaviorSubject(testCustomIconSetConfiguration);
          },
        }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconSetConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSetConfigurationComponent } from 'src/app/tool/icon-set-config/presentation/icon-set-configuration/icon-set-configuration.component';
import { MockModule, MockProvider, MockProviders } from 'ng-mocks';
import { IconSetConfigurationService } from '../../service/icon-set-configuration.service';
import { IconDictionaryService } from '../../service/icon-dictionary.service';
import { IconSetCustomizationService } from '../../service/icon-set-customization.service';
import { BehaviorSubject } from 'rxjs';
import {
  CustomIconSetConfiguration,
  testCustomIconSetConfiguration,
} from '../../../../domain/entity/iconSetConfiguration';
import { Dictionary } from '../../../../domain/entity/common/dictionary';
import { IconSetDetailsComponent } from '../icon-set-details/icon-set-details.component';
import { MaterialModule } from 'src/app/material.module';

describe(IconSetConfigurationComponent.name, () => {
  let component: IconSetConfigurationComponent;
  let fixture: ComponentFixture<IconSetConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [IconSetConfigurationComponent, IconSetDetailsComponent],
      providers: [
        MockProviders(IconSetConfigurationService),
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
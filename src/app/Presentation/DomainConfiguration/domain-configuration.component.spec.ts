import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainConfigurationComponent } from 'src/app/Presentation/DomainConfiguration/domain-configuration.component';
import { MockModule, MockProvider, MockProviders } from 'ng-mocks';
import { DomainConfigurationService } from '../../Service/DomainConfiguration/domain-configuration.service';
import { IconDictionaryService } from '../../Service/DomainConfiguration/icon-dictionary.service';
import { DomainCustomizationService } from '../../Service/DomainConfiguration/domain-customization.service';
import { BehaviorSubject } from 'rxjs';
import {
  CustomDomainConfiguration,
  testCustomDomainConfiguration,
} from '../../Domain/Common/domainConfiguration';
import { Dictionary } from '../../Domain/Common/dictionary/dictionary';
import { DomainDetailsComponent } from './domain-details/domain-details.component';
import { MaterialModule } from 'src/app/material.module';

describe('DomainConfigurationComponent', () => {
  let component: DomainConfigurationComponent;
  let fixture: ComponentFixture<DomainConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [DomainConfigurationComponent, DomainDetailsComponent],
      providers: [
        MockProviders(DomainConfigurationService),
        MockProvider(IconDictionaryService, {
          getFullDictionary(): Dictionary {
            return new Dictionary();
          },
        }),
        MockProvider(DomainCustomizationService, {
          getDomainConfiguration(): BehaviorSubject<CustomDomainConfiguration> {
            return new BehaviorSubject(testCustomDomainConfiguration);
          },
        }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DomainConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

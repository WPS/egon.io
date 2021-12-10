import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainConfigurationComponent } from 'src/app/Presentation/DomainConfiguration/domain-configuration.component';
import { MockProvider, MockProviders } from 'ng-mocks';
import { DomainConfigurationService } from '../../Service/DomainConfiguration/domain-configuration.service';
import { IconDictionaryService } from '../../Service/DomainConfiguration/icon-dictionary.service';
import { DomainCustomizationService } from '../../Service/DomainConfiguration/domain-customization.service';
import { BehaviorSubject } from 'rxjs';
import {
  CustomDomainCofiguration,
  testCustomDomainConfiguration,
} from '../../Domain/Common/domainConfiguration';
import { Dictionary } from '../../Domain/Common/dictionary/dictionary';
import { DomainDetailsComponent } from './domain-details/domain-details.component';

describe('DomainConfigurationComponent', () => {
  let component: DomainConfigurationComponent;
  let fixture: ComponentFixture<DomainConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DomainConfigurationComponent, DomainDetailsComponent],
      providers: [
        MockProviders(DomainConfigurationService),
        MockProvider(IconDictionaryService, {
          getFullDictionary(): Dictionary {
            return new Dictionary();
          },
        }),
        MockProvider(DomainCustomizationService, {
          getDomainConfiguration(): BehaviorSubject<CustomDomainCofiguration> {
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

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DomainConfigurationComponent} from 'src/app/Presentation/DomainConfiguration/domain-configuration.component';
import {MockProviders} from 'ng-mocks';
import {DomainConfigurationService} from '../../Service/DomainConfiguration/domain-configuration.service';
import {IconDictionaryService} from '../../Service/DomainConfiguration/icon-dictionary.service';
import {DomainCustomizationService} from "../../Service/DomainConfiguration/domain-customization.service";

describe('DomainConfigurationComponent', () => {
  let component: DomainConfigurationComponent;
  let fixture: ComponentFixture<DomainConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DomainConfigurationComponent],
      providers: [
        MockProviders(DomainConfigurationService, IconDictionaryService, DomainCustomizationService)
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

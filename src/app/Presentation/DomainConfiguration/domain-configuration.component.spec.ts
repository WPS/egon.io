import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DomainConfigurationComponent} from 'src/app/Presentation/DomainConfiguration/domain-configuration.component';
import {MockService} from 'ng-mocks';
import {ModelerService} from '../../Service/Modeler/modeler.service';
import {DomainConfigurationService} from '../../Service/Domain-Configuration/domain-configuration.service';
import {IconDictionaryService} from '../../Service/Domain-Configuration/icon-dictionary.service';
import {DomSanitizer} from '@angular/platform-browser';

describe('DomainConfigurationComponent', () => {
  let component: DomainConfigurationComponent;
  let fixture: ComponentFixture<DomainConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DomainConfigurationComponent],
      providers: [
        {
          provide: ModelerService,
          useValue: MockService(ModelerService),
        },
        {
          provide: DomainConfigurationService,
          useValue: MockService(DomainConfigurationService),
        },
        {
          provide: IconDictionaryService,
        },
        {
          provide: DomSanitizer,
          useValue: MockService(DomSanitizer),
        },
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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainConfigurationComponent } from 'src/app/domain-configuration/component/domain-configuration.component';
import { MockService } from 'ng-mocks';
import { ModelerService } from '../../modeler/service/modeler.service';
import { DomainConfigurationService } from '../service/domain-configuration.service';
import { IconDictionaryService } from '../service/icon-dictionary.service';
import { DomSanitizer } from '@angular/platform-browser';

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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainDetailsComponent } from './domain-details.component';
import { MockModule, MockProviders } from 'ng-mocks';
import { DomainCustomizationService } from '../../../Service/DomainConfiguration/domain-customization.service';
import { MaterialModule } from 'src/app/material.module';

describe('DomainDetailsComponent', () => {
  let component: DomainDetailsComponent;
  let fixture: ComponentFixture<DomainDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [DomainDetailsComponent],
      providers: [MockProviders(DomainCustomizationService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DomainDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

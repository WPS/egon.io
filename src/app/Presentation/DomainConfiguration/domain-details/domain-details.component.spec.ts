import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DomainDetailsComponent} from './domain-details.component';
import {MockProviders} from "ng-mocks";
import {DomainCustomizationService} from "../../../Service/Domain-Configuration/domain-customization.service";

describe('DomainDetailsComponent', () => {
  let component: DomainDetailsComponent;
  let fixture: ComponentFixture<DomainDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DomainDetailsComponent],
      providers: [
        MockProviders(DomainCustomizationService)
      ]
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

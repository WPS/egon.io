import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSetComponent } from './icon-set.component';
import { MockProviders } from 'ng-mocks';
import { IconSetCustomizationService } from '../../services/icon-set-customization.service';

describe(IconSetComponent.name, () => {
  let component: IconSetComponent;
  let fixture: ComponentFixture<IconSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconSetComponent],
      providers: [MockProviders(IconSetCustomizationService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

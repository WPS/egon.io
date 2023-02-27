import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconListItemComponent } from './icon-list-item.component';
import { MockModule, MockProvider } from 'ng-mocks';
import { DomainCustomizationService } from '../../../Service/DomainConfiguration/domain-customization.service';
import { IconListItem } from '../../../Domain/Domain-Configuration/iconListItem';
import { BehaviorSubject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MaterialModule } from 'src/app/material.module';

describe('IconListItemComponent', () => {
  let component: IconListItemComponent;
  let fixture: ComponentFixture<IconListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [IconListItemComponent],
      providers: [
        MockProvider(DomainCustomizationService, {
          getIconForName: () => {
            return new BehaviorSubject<IconListItem>({} as IconListItem);
          },
        }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

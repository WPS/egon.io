import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconListItemComponent } from './icon-list-item.component';
import { MockModule, MockProvider } from 'ng-mocks';
import { IconSetCustomizationService } from '../../services/icon-set-customization.service';
import { IconListItem } from '../../domain/iconListItem';
import { BehaviorSubject } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';

describe('IconListItemComponent', () => {
  let component: IconListItemComponent;
  let fixture: ComponentFixture<IconListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [IconListItemComponent],
      providers: [
        MockProvider(IconSetCustomizationService, {
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

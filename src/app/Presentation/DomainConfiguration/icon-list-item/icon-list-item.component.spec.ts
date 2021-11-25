import {ComponentFixture, TestBed} from '@angular/core/testing';

import {IconListItemComponent} from './icon-list-item.component';
import {MockProvider} from "ng-mocks";
import {DomainCustomizationService} from "../../../Service/Domain-Configuration/domain-customization.service";
import {IconListItem} from "../../../Domain/Domain-Configuration/iconListItem";
import {BehaviorSubject} from "rxjs";

describe('IconListItemComponent', () => {
  let component: IconListItemComponent;
  let fixture: ComponentFixture<IconListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IconListItemComponent],
      providers: [
        MockProvider(DomainCustomizationService, {
          'getIconForName': () => {
            return new BehaviorSubject<IconListItem>({} as IconListItem)
          }
        })
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

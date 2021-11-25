import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsListItemComponent } from './details-list-item.component';

describe('DetailsListItemComponent', () => {
  let component: DetailsListItemComponent;
  let fixture: ComponentFixture<DetailsListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailsListItemComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

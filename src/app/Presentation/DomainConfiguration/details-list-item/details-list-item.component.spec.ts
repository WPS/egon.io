import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DetailsListItemComponent} from './details-list-item.component';

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
    spyOn(document, "getElementById").and.returnValue({src: ''} as unknown as HTMLElement)
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

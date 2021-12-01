import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelDictionaryDialogComponent } from './label-dictionary-dialog.component';

describe('LabelDictionaryDialogComponent', () => {
  let component: LabelDictionaryDialogComponent;
  let fixture: ComponentFixture<LabelDictionaryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabelDictionaryDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelDictionaryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

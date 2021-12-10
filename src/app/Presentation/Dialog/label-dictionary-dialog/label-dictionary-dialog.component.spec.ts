import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelDictionaryDialogComponent } from './label-dictionary-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MockComponent, MockProvider } from 'ng-mocks';
import { LabelDictionaryComponent } from '../../LabelDictionary/label-dictionary.component';

describe('LabelDictionaryDialogComponent', () => {
  let component: LabelDictionaryDialogComponent;
  let fixture: ComponentFixture<LabelDictionaryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LabelDictionaryDialogComponent,
        MockComponent(LabelDictionaryComponent),
      ],
      providers: [MockProvider(MatDialogRef)],
    }).compileComponents();
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

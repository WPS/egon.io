import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelDictionaryDialogComponent } from './label-dictionary-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MockComponent, MockModule, MockProvider } from 'ng-mocks';
import { LabelDictionaryComponent } from '../../../../Presentation/LabelDictionary/label-dictionary.component';
import { MaterialModule } from 'src/app/material.module';

describe('LabelDictionaryDialogComponent', () => {
  let component: LabelDictionaryDialogComponent;
  let fixture: ComponentFixture<LabelDictionaryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockModule, MockService } from 'ng-mocks';
import { MaterialModule } from 'src/app/material.module';
import { LabelDictionaryService } from '../../../../Service/LabelDictionary/label-dictionary.service';
import { LabelDictionaryComponent } from './label-dictionary.component';

describe('LabelDictionaryComponent', () => {
  let component: LabelDictionaryComponent;
  let fixture: ComponentFixture<LabelDictionaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [LabelDictionaryComponent],
      providers: [
        {
          provide: LabelDictionaryService,
          useValue: MockService(LabelDictionaryService),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelDictionaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

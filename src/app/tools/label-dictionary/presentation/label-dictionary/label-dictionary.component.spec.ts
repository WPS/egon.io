import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockModule } from 'ng-mocks';
import { MaterialModule } from 'src/app/material.module';
import { LabelDictionaryService } from '../../services/label-dictionary.service';
import { LabelDictionaryComponent } from './label-dictionary.component';
import { LabelEntry } from '../../domain/labelEntry';

describe('LabelDictionaryComponent', () => {
  let component: LabelDictionaryComponent;
  let fixture: ComponentFixture<LabelDictionaryComponent>;

  let labelDictionaryServiceSpy = jasmine.createSpyObj(
    LabelDictionaryService.name,
    [
      'createLabelDictionaries',
      'getWorkObjectLabels',
      'getActivityLabels',
      'massRenameLabels',
    ],
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [LabelDictionaryComponent],
      providers: [
        {
          provide: LabelDictionaryService,
          useValue: labelDictionaryServiceSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    labelDictionaryServiceSpy.getWorkObjectLabels.and.returnValue([
      {
        name: 'UNO',
        originalName: 'ONE',
        icon: 'data:image/svg+xml,<svg/>',
      },
      {
        name: 'TWO',
        originalName: 'TWO',
        icon: 'data:image/svg+xml,<svg/>',
      },
      {
        name: '',
        originalName: 'THREE',
        icon: 'data:image/svg+xml,<svg/>',
      },
    ]);
    labelDictionaryServiceSpy.createLabelDictionaries.and.returnValue([]);
    labelDictionaryServiceSpy.getActivityLabels.and.returnValue([
      {
        name: 'uno',
        originalName: 'one',
      },
      {
        name: 'two',
        originalName: 'two',
      },
      {
        name: '',
        originalName: 'three',
      },
    ]);
    fixture = TestBed.createComponent(LabelDictionaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save', () => {
    component.save();
    expect(labelDictionaryServiceSpy.massRenameLabels).toHaveBeenCalledOnceWith(
      ['uno', ''],
      ['one', 'three'],
      ['UNO', ''],
      ['ONE', 'THREE'],
    );
  });

  it('should cancel', () => {
    labelDictionaryServiceSpy.massRenameLabels.calls.reset();
    component.cancel();
    expect(labelDictionaryServiceSpy.massRenameLabels).not.toHaveBeenCalled();
    expect(component.activityEntries.map((entry) => entry.name)).toEqual([
      'one',
      'two',
      'three',
    ]);
    expect(component.workObjectEntries.map((entry) => entry.name)).toEqual([
      'ONE',
      'TWO',
      'THREE',
    ]);
  });

  it('should update activity entries', () => {
    // in order to reset the new names:
    component.cancel();

    let input: EventTarget = { value: 'uno' } as HTMLInputElement;
    let event: Event = { target: input } as Event;
    let activityEntry: LabelEntry = { originalName: 'one', name: 'one' };
    component.updateActivityEntry(event, activityEntry);

    expect(component.activityEntries.map((entry) => entry.name)).toEqual([
      'uno',
      'two',
      'three',
    ]);
  });

  it('should update workobject entries', () => {
    // in order to reset the new names:
    component.cancel();

    let input: EventTarget = { value: 'UNO' } as HTMLInputElement;
    let event: Event = { target: input } as Event;
    let workobjectEntry: LabelEntry = { originalName: 'ONE', name: 'ONE' };
    component.updateWorkobjectEntry(event, workobjectEntry);

    expect(component.workObjectEntries.map((entry) => entry.name)).toEqual([
      'UNO',
      'TWO',
      'THREE',
    ]);
  });
});

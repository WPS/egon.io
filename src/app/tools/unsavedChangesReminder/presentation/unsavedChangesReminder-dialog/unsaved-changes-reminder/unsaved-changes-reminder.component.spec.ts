import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsavedChangesReminderComponent } from './unsaved-changes-reminder.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MockProvider } from 'ng-mocks';

describe('UnsavedChangesReminderComponent', () => {
  let component: UnsavedChangesReminderComponent;
  let fixture: ComponentFixture<UnsavedChangesReminderComponent>;

  const importData = () => {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnsavedChangesReminderComponent],
      providers: [
        MockProvider(MatDialogRef),
        {
          provide: MAT_DIALOG_DATA,
          useValue: importData,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UnsavedChangesReminderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

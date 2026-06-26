import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsavedChangesReminderDialogComponent } from 'src/app/tools/unsaved-changes-reminder/presentation/unsaved-changes-reminder-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MockProvider } from 'ng-mocks';

describe('UnsavedChangesReminderDialogComponent', () => {
  let component: UnsavedChangesReminderDialogComponent;
  let fixture: ComponentFixture<UnsavedChangesReminderDialogComponent>;

  const importData = () => {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnsavedChangesReminderDialogComponent],
      providers: [
        MockProvider(MatDialogRef),
        {
          provide: MAT_DIALOG_DATA,
          useValue: importData,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UnsavedChangesReminderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

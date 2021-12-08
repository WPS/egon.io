import { ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { ActivityDialogComponent } from 'src/app/Presentation/Dialog/activity-dialog/activity-dialog.component';
import { FormBuilder } from '@angular/forms';
import { MockProviders } from 'ng-mocks';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ActivityDialogData } from '../../../Domain/Dialog/activityDialogData';
import { testActivityCanvasObject } from '../../../Domain/Common/activityCanvasObject';

describe('ActivityDialogComponent', () => {
  let component: ActivityDialogComponent;
  let fixture: ComponentFixture<ActivityDialogComponent>;

  const activityData: ActivityDialogData = {
    activity: testActivityCanvasObject,
    numberIsAllowedMultipleTimes: false,
    showNumberFields: false,
    saveFN: () => {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivityDialogComponent],
      providers: [
        MockProviders(MatDialog, MatDialogRef),
        {
          provide: MAT_DIALOG_DATA,
          useValue: activityData,
        },
        FormBuilder,
      ],
    }).compileComponents();
  });

  beforeEach(inject([FormBuilder], (formBuilder: FormBuilder) => {
    fixture = TestBed.createComponent(ActivityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

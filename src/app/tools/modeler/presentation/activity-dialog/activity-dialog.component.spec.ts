import { ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { ActivityDialogComponent } from 'src/app/tools/modeler/presentation/activity-dialog/activity-dialog.component';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MockModule, MockProviders } from 'ng-mocks';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ActivityDialogData } from '../../domain/activityDialogData';
import { testActivityCanvasObject } from '../../../../domain/entities/common/activityCanvasObject';
import { MaterialModule } from 'src/app/material.module';

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
      imports: [MockModule(MaterialModule), ReactiveFormsModule],
      declarations: [ActivityDialogComponent],
      providers: [
        MockProviders(MatDialog, MatDialogRef),
        {
          provide: MAT_DIALOG_DATA,
          useValue: activityData,
        },
        UntypedFormBuilder,
      ],
    }).compileComponents();
  });

  beforeEach(inject([UntypedFormBuilder], (formBuilder: UntypedFormBuilder) => {
    fixture = TestBed.createComponent(ActivityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

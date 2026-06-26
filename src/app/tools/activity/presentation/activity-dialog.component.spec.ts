import { ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { ActivityDialogComponent } from 'src/app/tools/activity/presentation/activity-dialog.component';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MockModule, MockProviders } from 'ng-mocks';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ActivityDialogData } from 'src/app/tools/activity/domain/activity-dialog-data';
import { testActivityCanvasObject } from 'src/app/domain/entities/activity-canvas-object';

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
      imports: [
        MockModule(MatDialogModule),
        MockModule(MatFormFieldModule),
        MockModule(MatInputModule),
        MockModule(MatButtonModule),
        ReactiveFormsModule,
        ActivityDialogComponent,
      ],
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

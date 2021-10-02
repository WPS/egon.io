import { ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { ActivityDialogComponent } from 'src/app/modeler/component/activity-dialog/activity-dialog.component';
import { FormBuilder } from '@angular/forms';

xdescribe('ActivityDialogComponent', () => {
  let component: ActivityDialogComponent;
  let fixture: ComponentFixture<ActivityDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivityDialogComponent],
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

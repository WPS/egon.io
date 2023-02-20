import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoDialogComponent } from 'src/app/Presentation/Dialog/info-dialog/info-dialog.component';
import { MockProviders } from 'ng-mocks';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { UntypedFormBuilder } from '@angular/forms';
import { InfoDialogData } from '../../../Domain/Dialog/infoDialogData';

describe('InfoDialogComponent', () => {
  let component: InfoDialogComponent;
  let fixture: ComponentFixture<InfoDialogComponent>;

  const infoData: InfoDialogData = {
    isInfo: true,
    infoText: '',
    isLink: false,
    title: '',
    linkText: undefined,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfoDialogComponent],
      providers: [
        MockProviders(MatDialog, MatDialogRef),
        {
          provide: MAT_DIALOG_DATA,
          useValue: infoData,
        },
        UntypedFormBuilder,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoDialogComponent);
    component = fixture.componentInstance;

    spyOn(document, 'getElementsByClassName').and.returnValue([
      { style: { height: 1 } },
    ] as unknown as HTMLCollection);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

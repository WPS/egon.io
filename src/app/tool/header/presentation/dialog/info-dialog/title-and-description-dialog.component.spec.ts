import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleAndDescriptionDialogComponent } from 'src/app/tool/header/presentation/dialog/info-dialog/title-and-description-dialog.component';
import { MockProviders } from 'ng-mocks';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { UntypedFormBuilder } from '@angular/forms';
import { InfoDialogData } from '../../../../../Domain/Dialog/infoDialogData';

describe('InfoDialogComponent', () => {
  let component: TitleAndDescriptionDialogComponent;
  let fixture: ComponentFixture<TitleAndDescriptionDialogComponent>;

  const infoData: InfoDialogData = {
    isInfo: true,
    infoText: '',
    isLink: false,
    title: '',
    linkText: undefined,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [TitleAndDescriptionDialogComponent],
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
    fixture = TestBed.createComponent(TitleAndDescriptionDialogComponent);
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

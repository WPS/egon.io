import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDialogComponent } from 'src/app/tools/export/presentation/export-dialog/export-dialog.component';
import { MockProvider } from 'ng-mocks';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExportDialogData } from '../../domain/dialog/exportDialogData';

describe('ExportDialogComponent', () => {
  let component: ExportDialogComponent;
  let fixture: ComponentFixture<ExportDialogComponent>;

  const exportData: ExportDialogData = {
    title: '',
    defaultFilename: '',
    options: [
      {
        text: '1',
        tooltip: '',
        fn: () => {},
      },
      {
        text: '2',
        tooltip: '',
        fn: () => {},
      },
      {
        text: '3',
        tooltip: '',
        fn: () => {},
      },
      {
        text: '4',
        tooltip: '',
        fn: () => {},
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportDialogComponent],
      providers: [
        MockProvider(MatDialogRef),
        {
          provide: MAT_DIALOG_DATA,
          useValue: exportData,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('doOption should forward the current export settings and close', () => {
    const dialogRef = TestBed.inject(MatDialogRef) as jest.Mocked<
      MatDialogRef<ExportDialogComponent>
    >;
    const fnSpy = jest.spyOn(exportData.options[0], 'fn');

    (component as any).updateFileName({
      target: { value: 'my-file' },
    } as unknown as Event);
    (component as any).updateWithTitle(false);
    (component as any).updateUseWhiteBackground(false);
    (component as any).onExportAnimatedSvg(true);
    (component as any).doOption(0);

    expect(fnSpy).toHaveBeenCalledWith('my-file', false, false, 2);
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('doOption should fall back to the default filename and no animation speed', () => {
    const fnSpy = jest.spyOn(exportData.options[1], 'fn');

    (component as any).doOption(1);

    expect(fnSpy).toHaveBeenCalledWith('', true, true, undefined);
  });

  it('close should close the dialog', () => {
    const dialogRef = TestBed.inject(MatDialogRef) as jest.Mocked<
      MatDialogRef<ExportDialogComponent>
    >;

    (component as any).close();

    expect(dialogRef.close).toHaveBeenCalled();
  });
});

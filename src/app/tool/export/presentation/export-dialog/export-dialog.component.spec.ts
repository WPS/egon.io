import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDialogComponent } from 'src/app/tool/export/presentation/export-dialog/export-dialog.component';
import { MockModule, MockProvider } from 'ng-mocks';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExportDialogData } from '../../domain/dialog/exportDialogData';
import { MaterialModule } from 'src/app/material.module';

describe('ExportDialogComponent', () => {
  let component: ExportDialogComponent;
  let fixture: ComponentFixture<ExportDialogComponent>;

  const exportData: ExportDialogData = {
    title: '',
    options: [
      { text: '1', tooltip: '', fn: () => {} },
      { text: '2', tooltip: '', fn: () => {} },
      { text: '3', tooltip: '', fn: () => {} },
      { text: '4', tooltip: '', fn: () => {} },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [ExportDialogComponent],
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
});

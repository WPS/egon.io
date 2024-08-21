import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, MockProvider } from 'ng-mocks';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialModule } from 'src/app/material.module';
import { ImportUrlDialogComponent } from './import-url-dialog.component';

describe('ImportDialogComponent', () => {
  let component: ImportUrlDialogComponent;
  let fixture: ComponentFixture<ImportUrlDialogComponent>;

  const importData = () => {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [ImportUrlDialogComponent],
      providers: [
        MockProvider(MatDialogRef),
        {
          provide: MAT_DIALOG_DATA,
          useValue: importData,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportUrlDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

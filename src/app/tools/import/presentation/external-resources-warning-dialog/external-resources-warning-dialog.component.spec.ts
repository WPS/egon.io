import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalResourcesWarningDialogComponent } from './external-resources-warning-dialog.component';
import { MockModule, MockProvider } from 'ng-mocks';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ImportDialogComponent } from 'src/app/tools/import/presentation/import-dialog/import-dialog.component';

describe('ExternalResourcesWarningDialogComponent', () => {
  let component: ExternalResourcesWarningDialogComponent;
  let fixture: ComponentFixture<ExternalResourcesWarningDialogComponent>;

  const importData = () => {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MockModule(MatDialogModule),
        MockModule(MatFormFieldModule),
        MockModule(MatInputModule),
        MockModule(MatButtonModule),
        ImportDialogComponent,
      ],
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
    fixture = TestBed.createComponent(ExternalResourcesWarningDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

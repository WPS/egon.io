import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, MockProvider } from 'ng-mocks';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ImportDialogComponent } from './import-dialog.component';

describe('ImportDialogComponent', () => {
  let component: ImportDialogComponent;
  let fixture: ComponentFixture<ImportDialogComponent>;

  const importData = jest.fn();

  beforeEach(async () => {
    importData.mockClear();
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
    fixture = TestBed.createComponent(ImportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updateUrl should store the entered url', () => {
    const input = document.createElement('input');
    input.value = 'https://example.com/story.egn';

    (component as any).updateUrl({ target: input } as unknown as Event);

    expect((component as any).fileUrl()).toBe('https://example.com/story.egn');
  });

  it('doImport should invoke the callback with the url and close the dialog', () => {
    const dialogRef = TestBed.inject(MatDialogRef) as jest.Mocked<
      MatDialogRef<ImportDialogComponent>
    >;
    (component as any).fileUrl.set('https://example.com/story.egn');

    (component as any).doImport();

    expect(importData).toHaveBeenCalledWith('https://example.com/story.egn');
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('close should close the dialog', () => {
    const dialogRef = TestBed.inject(MatDialogRef) as jest.Mocked<
      MatDialogRef<ImportDialogComponent>
    >;

    (component as any).close();

    expect(dialogRef.close).toHaveBeenCalled();
  });
});

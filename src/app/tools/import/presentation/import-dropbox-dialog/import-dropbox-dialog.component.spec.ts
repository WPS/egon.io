import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDropboxDialogComponent } from './import-dropbox-dialog.component';
import { MockModule, MockProvider } from 'ng-mocks';
import { MaterialModule } from '../../../../material.module';
import { MatDialogRef } from '@angular/material/dialog';

describe('ImportDropboxDialogComponent', () => {
  let component: ImportDropboxDialogComponent;
  let fixture: ComponentFixture<ImportDropboxDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(MaterialModule)],
      declarations: [ImportDropboxDialogComponent],
      providers: [
        MockProvider(MatDialogRef)
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportDropboxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

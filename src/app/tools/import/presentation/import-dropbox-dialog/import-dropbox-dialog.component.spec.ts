import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDropboxDialogComponent } from './import-dropbox-dialog.component';

describe('ImportDropboxDialogComponent', () => {
  let component: ImportDropboxDialogComponent;
  let fixture: ComponentFixture<ImportDropboxDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportDropboxDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportDropboxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

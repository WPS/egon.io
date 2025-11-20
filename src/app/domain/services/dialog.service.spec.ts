import { TestBed } from '@angular/core/testing';

import { DialogService } from 'src/app/domain/services/dialog.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

describe('DialogService', () => {
  let service: DialogService;
  let matDialogSpy: jasmine.Spy;
  let dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({}),
    close: null,
  });
  dialogRefSpyObj.componentInstance = { body: '' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(MatDialog)],
    });
    matDialogSpy = spyOn(TestBed.inject(MatDialog), 'open');

    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open Keyboard Shortcut Dialog', () => {
    const config = new MatDialogConfig();

    config.data = {
      title: 'Keyboard Shortcuts',
      shortCuts: [],
    };
    service.openKeyboardShortcutsDialog();

    expect(matDialogSpy).toHaveBeenCalled();
  });
});

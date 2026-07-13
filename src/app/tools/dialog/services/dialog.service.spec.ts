import { TestBed } from '@angular/core/testing';

import { DialogService } from 'src/app/tools/dialog/services/dialog.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

describe('DialogService', () => {
  let service: DialogService;
  let matDialogSpy: jest.SpyInstance;
  const dialogRefSpyObj = {
    afterClosed: jest.fn().mockReturnValue(of({})),
    close: jest.fn(),
    componentInstance: { body: '' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(MatDialog)],
    });
    matDialogSpy = jest.spyOn(TestBed.inject(MatDialog), 'open');

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

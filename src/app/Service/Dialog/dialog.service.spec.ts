import { TestBed } from '@angular/core/testing';

import { DialogService } from 'src/app/Service/Dialog/dialog.service';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { InfoDialogData } from '../../Domain/Dialog/infoDialogData';
import { InfoDialogComponent } from '../../Presentation/Dialog/info-dialog/info-dialog.component';
import { MockProvider, MockProviders } from 'ng-mocks';
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
    matDialogSpy = spyOn(TestBed.get(MatDialog), 'open');

    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('dialog should open', () => {
    const config = new MatDialogConfig();

    config.disableClose = false;
    config.autoFocus = true;

    const title = 'Test';
    const text = 'Test.';
    config.data = new InfoDialogData(title, text, true);
    service.openDialog(InfoDialogComponent, config);

    expect(matDialogSpy).toHaveBeenCalled();
  });
});

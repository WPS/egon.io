import { TestBed } from '@angular/core/testing';

import { DialogService } from 'src/app/Service/Dialog/dialog.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { InfoDialogData } from '../../Presentation/Dialog/info-dialog/infoDialogData';
import { InfoDialogComponent } from '../../Presentation/Dialog/info-dialog/info-dialog.component';
import { MockModule } from 'ng-mocks';

xdescribe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MockModule(MatDialog)],
    });
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
  });
});

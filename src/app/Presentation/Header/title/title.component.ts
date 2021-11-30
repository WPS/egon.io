import { Component } from '@angular/core';
import { TitleService } from '../../../Service/Title/title.service';
import { Observable } from 'rxjs';
import { MatDialogConfig } from '@angular/material/dialog';
import { HeaderDialogComponent } from '../../Dialog/header-dialog/header-dialog.component';
import { DialogService } from '../../../Service/Dialog/dialog.service';

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
})
export class TitleComponent {
  title: Observable<string>;
  mouseOver = false;

  constructor(
    private titleService: TitleService,
    private dialogService: DialogService
  ) {
    this.title = this.titleService.getTitleObservable();
  }
  openHeaderDialog(): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    this.dialogService.openDialog(HeaderDialogComponent, config);
  }
}

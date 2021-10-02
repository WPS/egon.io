import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../service/title.service';
import { Observable } from 'rxjs';
import { MatDialogConfig } from '@angular/material/dialog';
import { HeaderDialogComponent } from '../../../header/header-dialog/header-dialog.component';
import { DialogService } from '../../../dialog/service/dialog.service';

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
})
export class TitleComponent implements OnInit {
  title: Observable<string>;
  mouseOver = false;

  constructor(
    private titleService: TitleService,
    private dialogService: DialogService
  ) {
    this.title = this.titleService.getTitleObservable();
  }

  ngOnInit(): void {}

  openHeaderDialog(): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    this.dialogService.openDialog(HeaderDialogComponent, config);
  }
}

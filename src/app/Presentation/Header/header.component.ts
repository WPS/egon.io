import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TitleService } from '../../Service/Title/title.service';
import { MatDialogConfig } from '@angular/material/dialog';
import { HeaderDialogComponent } from '../Dialog/header-dialog/header-dialog.component';
import { DialogService } from '../../Service/Dialog/dialog.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  showDescription: Observable<boolean>;
  currentDomainName: Observable<string>;

  mouseOver = false;
  title: Observable<string>;
  description: Observable<string>;

  constructor(
    private titleService: TitleService,
    private dialogService: DialogService
  ) {
    this.title = this.titleService.getTitleObservable();
    this.description = this.titleService.getDescriptionObservable();

    this.showDescription = this.titleService.getShowDescriptionObservable();
    this.currentDomainName = this.titleService.getDomainNameAsObservable();
  }

  openHeaderDialog(): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    this.dialogService.openDialog(HeaderDialogComponent, config);
  }
}

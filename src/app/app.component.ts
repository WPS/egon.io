import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/Service/Settings/settings.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { DialogService } from './Service/Dialog/dialog.service';
import { MatDialogConfig } from '@angular/material/dialog';
import { InfoDialogData } from './Domain/Dialog/infoDialogData';
import { InfoDialogComponent } from './Presentation/Dialog/info-dialog/info-dialog.component';
import { TitleService } from './Service/Title/title.service';
import { ExportService } from './Service/Export/export.service';
import { ReplayStateService } from './Service/Replay/replay-state.service';
import { ReplayService } from './Service/Replay/replay.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  showSettings$: Observable<boolean> | BehaviorSubject<boolean>;
  showDescription$: Observable<boolean>;
  version: string = environment.version;

  constructor(
    private settingsService: SettingsService,
    private dialogService: DialogService,
    private titleService: TitleService,
    private exportService: ExportService,
    private replayStateService: ReplayStateService,
    replayService: ReplayService,
  ) {
    this.showSettings$ = new BehaviorSubject(false);
    this.showDescription$ = new BehaviorSubject(true);

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        if (this.exportService.isDomainStoryExportable()) {
          this.exportService.downloadDST();
        }
      }
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('import')?.click();
      }
      if (
        (e.key === 'ArrowRight' || e.key === 'ArrowUp') &&
        this.replayStateService.getReplayOn()
      ) {
        e.preventDefault();
        e.stopPropagation();
        replayService.nextSentence();
      }
      if (
        (e.key === 'ArrowLeft' || e.key === 'ArrowDown') &&
        this.replayStateService.getReplayOn()
      ) {
        e.preventDefault();
        e.stopPropagation();
        replayService.previousSentence();
      }
    });
  }

  ngOnInit(): void {
    this.showDescription$ = this.titleService.showDescription$;
    this.showSettings$ = this.settingsService.showSettings$;
  }

  openLinkDialog(link: string, title: string, text: string): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;

    config.data = new InfoDialogData(title, text, true, true, link);

    this.dialogService.openDialog(InfoDialogComponent, config);
  }
}

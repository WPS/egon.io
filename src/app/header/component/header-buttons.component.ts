import { Component, Input } from '@angular/core';
import { SettingsService } from '../../settings-module/service/settings.service';
import { TitleService } from '../../titleAndDescription/service/title.service';
import { ModelerService } from '../../modeler/service/modeler.service';
import { Observable } from 'rxjs';
import { ReplayStateService } from '../../replay-service/replay-state.service';
import { DirtyFlagService } from '../../dirtyFlag-service/dirty-flag.service';
import {
  ExportDialogData,
  ExportOption,
} from '../../export/component/export-dialog/exportDialogData';
import { MatDialogConfig } from '@angular/material/dialog';
import { ExportDialogComponent } from '../../export/component/export-dialog/export-dialog.component';
import { InfoDialogData } from '../../dialog/component/confirm-dialog/infoDialogData';
import { InfoDialogComponent } from '../../dialog/component/confirm-dialog/info-dialog.component';
import { ElementRegistryService } from '../../elementRegistry-service/element-registry.service';
import { DialogService } from '../../dialog/service/dialog.service';
import { ReplayService } from '../../replay-service/replay.service';
import { ExportService } from '../../export/service/export.service';
import { ImportDomainStoryService } from '../../import-service/import-domain-story.service';

@Component({
  selector: 'app-header-buttons',
  templateUrl: './header-buttons.component.html',
  styleUrls: ['./header-buttons.component.scss'],
})
export class HeaderButtonsComponent {
  isReplay: Observable<boolean>;
  isDirty: Observable<boolean>;
  currentStepNumber: Observable<number>;
  maxStepNumber: Observable<number>;

  showDescription: Observable<boolean>;

  constructor(
    private settingsService: SettingsService,
    private titleService: TitleService,
    private modelerService: ModelerService,
    private replayStateService: ReplayStateService,
    private dirtyFlagService: DirtyFlagService,
    private elementRegistryService: ElementRegistryService,
    private dialogService: DialogService,
    private replayService: ReplayService,
    private exportService: ExportService,
    private importService: ImportDomainStoryService
  ) {
    this.isReplay = this.replayStateService.getReplayOnObservable();
    this.isDirty = this.dirtyFlagService.dirtySubject;
    this.currentStepNumber =
      this.replayService.getCurrentStepNumberObservable();
    this.maxStepNumber = this.replayService.getMaxStepNumberObservable();
    this.showDescription = this.titleService.getShowDescriptionObservable();

    this.setShortcuts();
  }

  private setShortcuts(): void {
    document.onkeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        this.exportService.downloadDST();
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.ctrlKey && e.key === 'l') {
        // @ts-ignore
        document.getElementById('import').click();
        e.preventDefault();
        e.stopPropagation();
      }
    };
  }

  public import(): void {
    // @ts-ignore
    const filename = document.getElementById('import').files[0].name;
    if (filename.endsWith('.dst')) {
      this.importService.importDST(
        // @ts-ignore
        document.getElementById('import').files[0],
        filename,
        false
      );
    } else if (filename.endsWith('.svg')) {
      this.importService.importDST(
        // @ts-ignore
        document.getElementById('import').files[0],
        filename,
        true
      );
    }
    this.modelerService.commandStackChanged();
  }

  public openSettings(): void {
    this.settingsService.open();
  }

  public setShowDescription(show: boolean): void {
    this.titleService.setShowDescription(show);
  }

  public openDownloadDialog(): void {
    if (this.exportService.isDomainStoryExportable()) {
      const option1 = new ExportOption('DST', () =>
        this.exportService.downloadDST()
      );
      const option2 = new ExportOption('SVG', () =>
        this.exportService.downloadSVG()
      );
      const option3 = new ExportOption('PNG', () =>
        this.exportService.downloadPNG()
      );
      const option4 = new ExportOption('HTML', () =>
        this.exportService.downloadHTMLPresentation()
      );

      const config = new MatDialogConfig();
      config.disableClose = false;
      config.autoFocus = true;
      config.data = new ExportDialogData('Export', [
        option1,
        option2,
        option3,
        option4,
      ]);

      this.dialogService.openDialog(ExportDialogComponent, config);
    } else {
      this.openExportErrorDialog();
    }
  }

  private openExportErrorDialog(): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;

    const title = 'Export Error';
    const text = 'There currently is no DomainStory to export.';
    config.data = new InfoDialogData(title, text, true);

    this.dialogService.openDialog(InfoDialogComponent, config);
  }

  public openKeyboardShortcutsDialog(): void {
    const title = 'Keyboard shortcuts';
    const shortCutText =
      'Undo:\t\t\tctrl + Z \n' +
      'Redo:\t\t\tctrl + Y    OR   ctrl + shift + Z\n' +
      'Select All:\t\tctrl + A\n' +
      'Export as DST:\t\tctrl + S\n' +
      'Import Domain Story: \tctrl + L\n' +
      'Search for text:\tctrl + F\n' +
      'Direct editing:\t\tE\n' +
      'Hand tool:\t\tH\n' +
      'Lasso tool:\t\tL\n' +
      'Space tool:\t\tS';

    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;

    config.data = new InfoDialogData(title, shortCutText, true);

    this.dialogService.openDialog(InfoDialogComponent, config);
  }

  public startReplay(): void {
    this.replayService.startReplay();
  }

  public stopReplay(): void {
    this.replayService.stopReplay();
  }

  public previousStep(): void {
    this.replayService.previousStep();
  }

  public nextStep(): void {
    this.replayService.nextStep();
  }
}
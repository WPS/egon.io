import {Component} from '@angular/core';
import {SettingsService} from '../../Service/Settings/settings.service';
import {TitleService} from '../../Service/Title/title.service';
import {ModelerService} from '../../Service/Modeler/modeler.service';
import {Observable} from 'rxjs';
import {ReplayStateService} from '../../Service/Replay/replay-state.service';
import {DirtyFlagService} from '../../Service/DirtyFlag/dirty-flag.service';
import {ExportDialogData, ExportOption,} from '../../Domain/Dialog/exportDialogData';
import {MatDialogConfig} from '@angular/material/dialog';
import {ExportDialogComponent} from '../Dialog/export-dialog/export-dialog.component';
import {InfoDialogData} from '../../Domain/Dialog/infoDialogData';
import {InfoDialogComponent} from '../Dialog/info-dialog/info-dialog.component';
import {ElementRegistryService} from '../../Service/ElementRegistry/element-registry.service';
import {DialogService} from '../../Service/Dialog/dialog.service';
import {ReplayService} from '../../Service/Replay/replay.service';
import {ExportService} from '../../Service/Export/export.service';
import {ImportDomainStoryService} from '../../Service/Import/import-domain-story.service';
import {LabelDictionaryDialogComponent} from '../Dialog/label-dictionary-dialog/label-dictionary-dialog.component';
import {HeaderDialogComponent} from "../Dialog/header-dialog/header-dialog.component";

@Component({
  selector: 'app-header-buttons',
  templateUrl: './header-buttons.component.html',
  styleUrls: ['./header-buttons.component.scss'],
})
export class HeaderButtonsComponent {
  isReplay: Observable<boolean>;
  isDirty: Observable<boolean>;

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
    this.showDescription = this.titleService.getShowDescriptionObservable();

    this.setShortcuts();
  }

  private setShortcuts(): void {
    document.onkeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        if (this.exportService.isDomainStoryExportable()) {
          this.exportService.downloadDST();
        }
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
    }
  }


  private openNoDomainStoryDialog(title: string, text: string): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;

    config.data = new InfoDialogData(title, text, true);

    this.dialogService.openDialog(InfoDialogComponent, config);
  }


  public openHeaderDialog()
    :
    void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    this.dialogService.openDialog(HeaderDialogComponent, config);
  }

  public openKeyboardShortcutsDialog(): void {
    const title = 'Keyboard shortcuts';
    const shortCutText =
      'Undo:\t\t\t\t\tctrl + Z \n' +
      'Redo:\t\t\t\t\tctrl + Y    OR   ctrl + shift + Z\n' +
      'Select All:\t\t\t\tctrl + A\n' +
      'Export as DST:\t\t\tctrl + S\n' +
      'Import Domain Story: \tctrl + L\n' +
      'Search for text:\t\t\tctrl + F\n' +
      'Direct editing:\t\t\tE\n' +
      'Hand tool:\t\t\t\tH\n' +
      'Lasso tool:\t\t\t\tL\n' +
      'Space tool:\t\t\t\tS';

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

  openLabelDictionary() {
    if (this.exportService.isDomainStoryExportable()) {
      const config = new MatDialogConfig();
      config.disableClose = false;
      config.autoFocus = true;

      this.dialogService.openDialog(LabelDictionaryDialogComponent, config);
    } else {
      this.openNoDomainStoryDialog(
        'Label Dictionary Error',
        'There are currently no Elements on the canvas'
      );
    }
  }
}

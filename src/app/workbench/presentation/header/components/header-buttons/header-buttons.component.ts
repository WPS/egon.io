import { Component } from '@angular/core';
import { SettingsService } from '../../../../../Service/Settings/settings.service';
import { ModelerService } from '../../../../../Service/Modeler/modeler.service';
import { Observable } from 'rxjs';
import { ReplayStateService } from '../../../../../Service/Replay/replay-state.service';
import { DirtyFlagService } from '../../../../../Service/DirtyFlag/dirty-flag.service';
import {
  ExportDialogData,
  ExportOption,
} from '../../../../../Domain/Dialog/exportDialogData';
import { MatDialogConfig } from '@angular/material/dialog';
import { ExportDialogComponent } from '../../../../../Presentation/Dialog/export-dialog/export-dialog.component';
import { InfoDialogData } from '../../../../../Domain/Dialog/infoDialogData';
import { TitleAndDescriptionDialogComponent } from '../../../../../Presentation/Dialog/info-dialog/title-and-description-dialog.component';
import { DialogService } from '../../../../../Service/Dialog/dialog.service';
import { ReplayService } from '../../../../../Service/Replay/replay.service';
import { ExportService } from '../../../../../Service/Export/export.service';
import { ImportDomainStoryService } from '../../../../../Service/Import/import-domain-story.service';
import { LabelDictionaryDialogComponent } from '../../../../../Presentation/Dialog/label-dictionary-dialog/label-dictionary-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SNACKBAR_DURATION,
  SNACKBAR_INFO,
} from '../../../../../Domain/Common/constants';
import { TitleService } from '../../../../../Service/Title/title.service';
import { RendererService } from '../../../../../Service/Renderer/renderer.service';

@Component({
  selector: 'app-header-buttons',
  templateUrl: './header-buttons.component.html',
  styleUrls: ['./header-buttons.component.scss'],
})
export class HeaderButtonsComponent {
  isReplay$: Observable<boolean>;
  isDirty$: Observable<boolean>;

  constructor(
    private settingsService: SettingsService,
    private modelerService: ModelerService,
    private replayStateService: ReplayStateService,
    private dirtyFlagService: DirtyFlagService,
    private dialogService: DialogService,
    protected replayService: ReplayService,
    protected exportService: ExportService,
    private importService: ImportDomainStoryService,
    private titleService: TitleService,
    private renderService: RendererService,
    private snackbar: MatSnackBar,
  ) {
    this.isReplay$ = this.replayStateService.replayOn$;
    this.isDirty$ = this.dirtyFlagService.dirty$;
  }
  import(): void {
    // @ts-ignore
    const file = document.getElementById('import').files[0];
    const filename = file.name;

    const dstSvgPattern = /.*(.dst)(\s*\(\d+\)){0,1}\.svg/;
    const egnSvgPattern = /.*(.egn)(\s*\(\d+\)){0,1}\.svg/;

    if (filename.endsWith('.dst')) {
      this.importService.importDST(file, filename, false);
    } else if (filename.match(dstSvgPattern)) {
      this.importService.importDST(file, filename, true);
    } else if (filename.endsWith('.egn')) {
      this.importService.importEGN(file, filename, false);
    } else if (filename.match(egnSvgPattern)) {
      this.importService.importEGN(file, filename, true);
    }
    this.modelerService.commandStackChanged();
  }

  openSettings(): void {
    this.settingsService.open();
  }

  /** Open Dialogs **/
  openDownloadDialog(): void {
    if (this.exportService.isDomainStoryExportable()) {
      const SVGDownloadOption = new ExportOption(
        'SVG',
        'Download an SVG-Image with the Domain-Story embedded. Can be used to save and share your Domain-Story.',
        (withTitle: boolean, useWhiteBackground: boolean) =>
          this.exportService.downloadSVG(withTitle, useWhiteBackground),
      );
      const EGNDownloadOption = new ExportOption(
        'EGN',
        'Download an EGN-File with the Domain-Story. Can be used to save and share your Domain-Story.',
        () => this.exportService.downloadDST(),
      );
      const PNGDownloadOption = new ExportOption(
        'PNG',
        'Download a PNG-Image of the Domain-Story. This does not include the Domain-Story!',
        (withTitle: boolean) => this.exportService.downloadPNG(withTitle),
      );
      const HTMLDownloadOption = new ExportOption(
        'HTML-Presentation',
        'Download an HTML-Presentation. This does not include the Domain-Story!',
        () => this.exportService.downloadHTMLPresentation(),
      );

      const config = new MatDialogConfig();
      config.disableClose = false;
      config.autoFocus = true;
      config.data = new ExportDialogData('Export', [
        SVGDownloadOption,
        EGNDownloadOption,
        PNGDownloadOption,
        HTMLDownloadOption,
      ]);

      this.dialogService.openDialog(ExportDialogComponent, config);
    } else {
      this.snackbar.open('No Domain Story to be exported', undefined, {
        duration: SNACKBAR_DURATION,
        panelClass: SNACKBAR_INFO,
      });
    }
  }

  openKeyboardShortcutsDialog(): void {
    const title = 'Keyboard Shortcuts';
    const shortCutText =
      'Undo:\t\t\t\t\tctrl + Z \n' +
      'Redo:\t\t\t\t\tctrl + Y    OR   ctrl + shift + Z\n' +
      'Select All:\t\t\t\tctrl + A\n' +
      'Export as EGN:\t\t\tctrl + S\n' +
      'Import Domain Story: \t\tctrl + L\n' +
      'Search for text:\t\t\tctrl + F\n' +
      'Direct editing:\t\t\tE\n' +
      'Hand tool:\t\t\t\tH\n' +
      'Lasso tool:\t\t\t\tL\n' +
      'Space tool:\t\t\t\tS';

    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;

    config.data = new InfoDialogData(title, shortCutText, true);

    this.dialogService.openDialog(TitleAndDescriptionDialogComponent, config);
  }

  openLabelDictionary(): void {
    if (this.exportService.isDomainStoryExportable()) {
      const config = new MatDialogConfig();
      config.disableClose = false;
      config.autoFocus = true;

      this.dialogService.openDialog(LabelDictionaryDialogComponent, config);
    } else {
      this.snackbar.open(
        'There are currently no Elements on the canvas',
        undefined,
        {
          duration: SNACKBAR_DURATION,
          panelClass: SNACKBAR_INFO,
        },
      );
    }
  }

  createNewDomainStory(): void {
    this.titleService.reset();
    this.renderService.reset();
    this.dirtyFlagService.makeClean();
  }

  /** Replay functions **/
  startReplay(): void {
    this.replayService.startReplay();
  }

  stopReplay(): void {
    this.replayService.stopReplay();
  }

  previousSentence(): void {
    this.replayService.previousSentence();
  }

  nextSentence(): void {
    this.replayService.nextSentence();
  }

  isExportable(): boolean {
    return (
      this.titleService.hasTitleOrDescription() ||
      this.exportService.isDomainStoryExportable()
    );
  }
}

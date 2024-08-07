import { Component } from '@angular/core';
import { SettingsService } from '../../../services/settings/settings.service';
import { ModelerService } from '../../../../tools/modeler/services/modeler.service';
import { from, Observable, switchMap, tap } from 'rxjs';
import { ReplayStateService } from '../../../../tools/replay/services/replay-state.service';
import { DirtyFlagService } from '../../../../domain/services/dirty-flag.service';
import {
  ExportDialogData,
  ExportOption,
} from '../../../../tools/export/domain/dialog/exportDialogData';
import { MatDialogConfig } from '@angular/material/dialog';
import { ExportDialogComponent } from '../../../../tools/export/presentation/export-dialog/export-dialog.component';
import { InfoDialogData } from '../../../../tools/header/domain/infoDialogData';
import { InfoDialogComponent } from '../../../../tools/import/presentation/info-dialog/info-dialog.component';
import { DialogService } from '../../../../domain/services/dialog.service';
import { ReplayService } from '../../../../tools/replay/services/replay.service';
import { ExportService } from '../../../../tools/export/services/export.service';
import { ImportDomainStoryService } from '../../../../tools/import/services/import-domain-story.service';
import { LabelDictionaryDialogComponent } from '../../../../tools/label-dictionary/presentation/label-dictionary-dialog/label-dictionary-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SNACKBAR_DURATION,
  SNACKBAR_INFO,
} from '../../../../domain/entities/constants';
import { TitleService } from '../../../../tools/header/services/title.service';
import { RendererService } from '../../../../tools/modeler/services/renderer.service';
import { StoryCreatorService } from '../../../../tools/replay/services/story-creator.service';
import { ImportDialogComponent } from '../../../../tools/import/presentation/import-dialog/import-dialog.component';

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
    private storyCreatorService: StoryCreatorService,
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

  importFromUrl(fileUrl: string): void {
    from(fetch(fileUrl))
      .pipe(
        switchMap((response) => {
          return from(response.blob());
        }),
        tap((blob) => {
          const string = fileUrl.split('/');
          const filename = string[string.length - 1].replace(/%20/g, ' ');

          if (!filename) {
            throw new Error('Unable to extract filename from URL');
          }

          const dstSvgPattern = /.*(.dst)(\s*\(\d+\)){0,1}\.svg/;
          const egnSvgPattern = /.*(.egn)(\s*\(\d+\)){0,1}\.svg/;

          if (filename.endsWith('.dst')) {
            this.importService.importDST(blob, filename, false);
          } else if (filename.match(dstSvgPattern)) {
            this.importService.importDST(blob, filename, true);
          } else if (filename.endsWith('.egn')) {
            this.importService.importEGN(blob, filename, false);
          } else if (filename.match(egnSvgPattern)) {
            this.importService.importEGN(blob, filename, true);
          }
          this.modelerService.commandStackChanged();
        }),
      )
      .subscribe();
  }

  openUploadUrlDialog(): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    config.data = (fileUrl: string) => this.importFromUrl(fileUrl);
    this.dialogService.openDialog(ImportDialogComponent, config);
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
        () =>
          this.exportService.downloadHTMLPresentation(
            this.modelerService.getModeler(),
          ),
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

    this.dialogService.openDialog(InfoDialogComponent, config);
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
    const story = this.storyCreatorService.traceActivitiesAndCreateStory();
    const missingSentences =
      this.storyCreatorService.getMissingSentences(story);
    if (missingSentences.length === 0) {
      this.replayService.startReplay(story);
    } else {
      const sentence = missingSentences.join(', ');
      this.snackbar.open(
        missingSentences.length === 1
          ? `The Domain Story is not complete. Sentence ${sentence} is missing.`
          : `The Domain Story is not complete. Sentences ${sentence} are missing.`,
        undefined,
        {
          duration: SNACKBAR_DURATION * 2,
          panelClass: SNACKBAR_INFO,
        },
      );
    }
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

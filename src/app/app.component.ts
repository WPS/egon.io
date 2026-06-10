import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SettingsService } from 'src/app/workbench/services/settings/settings.service';
import { TitleService } from './tools/title/services/title.service';
import { ExportService } from './tools/export/services/export.service';
import { ReplayService } from './tools/replay/services/replay.service';
import { environment } from '../environments/environment';
import { ColorPickerDirective } from 'ngx-color-picker';
import { AutosaveService } from './tools/autosave/services/autosave.service';
import {
  BLACK,
  BLUE,
  CYAN,
  DARK_PINK,
  GREEN,
  GREY,
  LIGHT_PINK,
  LIME,
  ORANGE,
  PURPLE,
  RED,
  SNACKBAR_DURATION_LONG,
  SNACKBAR_INFO,
  YELLOW,
} from './domain/entities/constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModelerService } from './tools/modeler/services/modeler.service';
import { DirtyFlagService } from './domain/services/dirty-flag.service';

import { ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from './workbench/presentation/header/header/header.component';
import { SettingsComponent } from './workbench/presentation/settings/settings.component';
import { DragDirective } from './tools/import/directive/dragDrop.directive';
import { ImportDomainStoryService } from 'src/app/tools/import/services/import-domain-story.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],

  imports: [
    HeaderComponent,
    SettingsComponent,
    DragDirective,
    ColorPickerDirective,
    RouterModule,
  ],
})
export class AppComponent implements OnInit, AfterViewInit {
  version: string = environment.version;
  color: string = BLACK;

  @ViewChild(ColorPickerDirective, { static: false })
  colorPicker!: ColorPickerDirective;

  skipNextColorUpdate = false;

  // define preset colors that have good contrast on white background and are compatible to EventStorming notation
  readonly colorBox: string[] = [
    YELLOW,
    ORANGE,
    RED,
    LIGHT_PINK,
    DARK_PINK,
    PURPLE,
    BLUE,
    CYAN,
    GREEN,
    LIME,
    GREY,
    BLACK,
  ];

  private readonly settingsService = inject(SettingsService);
  private readonly titleService = inject(TitleService);
  private readonly exportService = inject(ExportService);
  private readonly autosaveService = inject(AutosaveService);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly snackbar = inject(MatSnackBar);
  private readonly replayService = inject(ReplayService);
  private readonly modelerService = inject(ModelerService);
  private readonly dirtyFlagService = inject(DirtyFlagService);
  private readonly importDomainStoryService = inject(ImportDomainStoryService);
  private readonly activatedRoute = inject(ActivatedRoute);

  showDescription = this.titleService.showDescription;
  showSettings = this.settingsService.showSettings;

  constructor() {
    this.importDomainStoryService
      .automatedImportSuccessFull$()
      .subscribe(() => {
        // A timeout is needed to make sure that the import and all asynchronous tasks are finished before the replay is started.
        setTimeout(() => {
          this.replayService.startReplay(true);
        }, 100);
      });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      const modifierPressed = e.ctrlKey || e.metaKey;

      const filename = this.exportService.getFilename();
      if (modifierPressed && e.key === 's' && !e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        if (this.exportService.isDomainStoryExportable()) {
          this.exportService.downloadEGN(filename);
        }
      }

      if (modifierPressed && e.altKey && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        if (this.exportService.isDomainStoryExportable()) {
          this.exportService.downloadSVG(filename, true, true, undefined);
        }
      }
      if (modifierPressed && e.key === 'l') {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('import')?.click();
      }
      if (
        (e.key === 'ArrowRight' || e.key === 'ArrowUp') &&
        this.replayService.getReplayOn()
      ) {
        e.preventDefault();
        e.stopPropagation();
        this.replayService.nextSentence();
      }
      if (
        (e.key === 'ArrowLeft' || e.key === 'ArrowDown') &&
        this.replayService.getReplayOn()
      ) {
        e.preventDefault();
        e.stopPropagation();
        this.replayService.previousSentence();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.skipNextColorUpdate = true;
        this.colorPicker.closeDialog();
      }
    });

    document.addEventListener('defaultColor', (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.color === 'black') {
        this.color = BLACK;
      } else {
        this.color = customEvent.detail.color;
      }
    });

    document.addEventListener('openColorPicker', () => {
      this.colorPicker.openDialog();
    });

    document.addEventListener('errorColoringOnlySvg', () => {
      this.snackbar.open('Only SVG icons can be colored', undefined, {
        duration: SNACKBAR_DURATION_LONG,
        panelClass: SNACKBAR_INFO,
      });
    });
  }

  ngOnInit(): void {
    this.modelerService.postInit();
  }

  onColorChanged(color: string) {
    if (this.skipNextColorUpdate) {
      this.skipNextColorUpdate = false;
      return;
    }
    document.dispatchEvent(
      new CustomEvent('pickedColor', { detail: { color: color } }),
    );
  }

  ngAfterViewInit(): void {
    this.activatedRoute.queryParamMap.subscribe((queryParams) => {
      const urlToLoad = queryParams.get('storyUrl');
      const startReplay = queryParams.get('startReplay') === 'true';
      if (urlToLoad) {
        this.importDomainStoryService.autoImportFromUrl(urlToLoad, startReplay);
      }
    });

    this.autosaveService.loadLatestDraft();
    this.cd.detectChanges();
  }

  @HostListener('window:beforeunload', ['$event'])
  onWindowClose(event: any): void {
    if (this.dirtyFlagService.dirty()) {
      event.returnValue = true;
    }
  }
}

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SettingsService } from 'src/app/workbench/services/settings/settings.service';
import { BehaviorSubject, Observable } from 'rxjs';
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
  SNACKBAR_DURATION,
  SNACKBAR_INFO,
  YELLOW,
} from './domain/entities/constants';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  showSettings$: Observable<boolean> | BehaviorSubject<boolean>;
  showDescription$: Observable<boolean>;
  version: string = environment.version;
  color: string = BLACK;

  @ViewChild(ColorPickerDirective, { static: false })
  colorPicker!: ColorPickerDirective;

  skipNextColorUpdate = false;

  // define preset colors that have good contrast on white background and are compatible to EventStorming notation
  colorBox: string[] = [
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

  constructor(
    private settingsService: SettingsService,
    private titleService: TitleService,
    private exportService: ExportService,
    private autosaveService: AutosaveService,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
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
        replayService.getReplayOn()
      ) {
        e.preventDefault();
        e.stopPropagation();
        replayService.nextSentence();
      }
      if (
        (e.key === 'ArrowLeft' || e.key === 'ArrowDown') &&
        replayService.getReplayOn()
      ) {
        e.preventDefault();
        e.stopPropagation();
        replayService.previousSentence();
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
        duration: SNACKBAR_DURATION * 2,
        panelClass: SNACKBAR_INFO,
      });
    });
  }

  ngOnInit(): void {
    this.showDescription$ = this.titleService.showDescription$;
    this.showSettings$ = this.settingsService.showSettings$;
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
    this.autosaveService.loadLatestDraft();
    this.cd.detectChanges();
  }
}

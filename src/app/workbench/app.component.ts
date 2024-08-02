import { Component, OnInit, ViewChild } from '@angular/core';
import { SettingsService } from 'src/app/Service/Settings/settings.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { TitleService } from '../Service/Title/title.service';
import { ExportService } from '../Service/Export/export.service';
import { ReplayStateService } from '../Service/Replay/replay-state.service';
import { ReplayService } from '../Service/Replay/replay.service';
import { environment } from '../../environments/environment';
import { ColorPickerDirective } from 'ngx-color-picker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  showSettings$: Observable<boolean> | BehaviorSubject<boolean>;
  showDescription$: Observable<boolean>;
  version: string = environment.version;
  color: string = '#000000';

  @ViewChild(ColorPickerDirective, { static: false })
  colorPicker!: ColorPickerDirective;

  skipNextColorUpdate = false;

  // define preset colors that have good contrast on white background and are compatible to EventStorming notation
  colorBox: string[] = [
    '#FDD835', // yellow
    '#FB8C00', // orange
    '#D32F2F', // red
    '#F48FB1', // light pink
    '#EC407A', // dark pink
    '#8E24AA', // purple
    '#1E88E5', // blue
    '#00ACC1', // cyan
    '#43A047', // green
    '#C0CA33', // lime
    '#9E9E9E', // grey
    '#000000', // black
  ];

  constructor(
    private settingsService: SettingsService,
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
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.skipNextColorUpdate = true;
        this.colorPicker.closeDialog();
      }
    });
  }

  ngOnInit(): void {
    this.showDescription$ = this.titleService.showDescription$;
    this.showSettings$ = this.settingsService.showSettings$;

    document.addEventListener('defaultColor', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.color = customEvent.detail.color;
    });

    document.addEventListener('openColorPicker', () => {
      this.colorPicker.openDialog();
    });
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
}

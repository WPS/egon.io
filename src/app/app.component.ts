import { Component, OnInit, ViewChild } from '@angular/core';
import { SettingsService } from 'src/app/Service/Settings/settings.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { TitleService } from './Service/Title/title.service';
import { ExportService } from './Service/Export/export.service';
import { ReplayStateService } from './Service/Replay/replay-state.service';
import { ReplayService } from './Service/Replay/replay.service';
import { environment } from '../environments/environment';
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

  // event storming colors for color picker
  colorBox: string[] = [
    '#FFEB3B', // yellow
    '#FF9800', // orange
    '#F44336', // red
    '#F48FB1', // pink
    '#9C27B0', // purple
    '#2196F3', // dark blue/purple
    '#00BCD4', // blue
    '#4CAF50', // darker green
    '#CDDC39', // green
    '#9E9E9E', // grey
    '#607D8B', // darker grey
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
    document.dispatchEvent(
      new CustomEvent('pickedColor', { detail: { color: color } }),
    );
  }
}

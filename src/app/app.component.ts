import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/Service/Settings/settings.service';
import { BehaviorSubject, Observable } from 'rxjs';
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
  color: string = '#000000';

  // event storming colors for color picker
  colorBox: string[] = [
    '#ff9d48', // orange
    '#a6ccf5', // blue
    '#9ea9ff', // dark blue/purple
    '#fff9b1', // yellow
    '#f5d128', // sonny yellow
    '#ea94bb', // pink
    '#d5f692', // green
    '#c9df56', // darker green
    '#c6a2d2', // purple
    '#eb7c88', // red
    '#9e9e9e', // grey
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
      setTimeout(() => {
        this.color = customEvent.detail.color;
      }, 10);
    });
  }

  onColorChanged(color: string) {
    document.dispatchEvent(
      new CustomEvent('pickedColor', { detail: { color: color } }),
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { AutosaveService } from '../service/autosave.service';
import { Autosave } from '../domain/autosave';
import { Observable } from 'rxjs';
import { AutosaveStateService } from '../service/autosave-state.service';

@Component({
  selector: 'app-autosave-settings',
  templateUrl: './autosave-settings.component.html',
  styleUrls: ['./autosave-settings.component.scss'],
})
export class AutosaveSettingsComponent implements OnInit {
  autosaves: Autosave[] = [];
  autosaveIntervalObservable: Observable<number>;
  autosaveEnabledObservable: Observable<boolean>;

  constructor(
    private autosaveService: AutosaveService,
    private autosaveStateService: AutosaveStateService
  ) {
    this.autosaveIntervalObservable =
      this.autosaveService.getAutosaveIntervalAsObservable();
    this.autosaveEnabledObservable =
      this.autosaveStateService.getAutosaveStateAsObservable();
  }

  ngOnInit(): void {
    this.autosaves = this.autosaveService.loadCurrentAutosaves();
    this.autosaveIntervalObservable =
      this.autosaveService.getAutosaveIntervalAsObservable();
    this.autosaveEnabledObservable =
      this.autosaveStateService.getAutosaveStateAsObservable();
  }

  public applyAutosave(autosave: Autosave): void {
    this.autosaveService.applyAutosave(autosave);
  }

  public changeAutosaveInterval(interval: number): void {
    this.autosaveService.changeAutosaveInterval(interval);
  }

  setInterval($event: any): void {
    this.autosaveService.changeAutosaveInterval($event.target.value);
  }

  setAutosaveState(): void {
    if (!this.autosaveStateService.getAutosaveState()) {
      this.autosaveService.startAutosaving();
    } else {
      this.autosaveService.stopAutosaving();
    }
  }
}

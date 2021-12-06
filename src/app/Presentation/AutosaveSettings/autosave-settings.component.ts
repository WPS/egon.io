import { Component, OnInit } from '@angular/core';
import { AutosaveService } from '../../Service/Autosave/autosave.service';
import { Autosave } from '../../Domain/Autosave/autosave';
import { AutosaveStateService } from '../../Service/Autosave/autosave-state.service';

@Component({
  selector: 'app-autosave-settings',
  templateUrl: './autosave-settings.component.html',
  styleUrls: ['./autosave-settings.component.scss'],
})
export class AutosaveSettingsComponent implements OnInit {
  autosaves: Autosave[] = [];
  autosaveEnabled: boolean;
  autosaveInterval: number;

  autosaveAmount: number;

  constructor(
    private autosaveService: AutosaveService,
    private autosaveStateService: AutosaveStateService
  ) {
    this.autosaveAmount = this.autosaveService.getMaxAutosaves();
    this.autosaveInterval = this.autosaveService.getAutosaveInterval();
    this.autosaveEnabled = this.autosaveStateService.getAutosaveState();
  }

  ngOnInit(): void {
    this.autosaves = this.autosaveService.loadCurrentAutosaves();
  }

  public loadAutosave(autosave: Autosave): void {
    this.autosaveService.loadAutosave(autosave);
  }

  setInterval($event: any): void {
    this.autosaveInterval = $event.target.value;
  }

  setAutosaveEnabled(): void {
    this.autosaveEnabled = !this.autosaveEnabled;
  }

  setAutosaveAmount($event: any) {
    this.autosaveAmount = $event.target.value;
  }

  save() {
    this.autosaveService.changeAutosaveInterval(this.autosaveInterval);

    if (this.autosaveEnabled) {
      this.autosaveService.startAutosaving();
    } else {
      this.autosaveService.stopAutosaving();
    }
  }
}

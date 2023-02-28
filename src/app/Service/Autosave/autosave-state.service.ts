import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from '../BrowserStorage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AutosaveStateService {
  private autosaveEnabled = new BehaviorSubject<boolean>(false);
  autosaveEnabled$ = this.autosaveEnabled.asObservable();

  constructor(private storageService: StorageService) {
    this.readAutosaveState();
  }

  private readAutosaveState(): void {
    const storedAutosafeState = this.isAutosaveEnabled();
    this.autosaveEnabled.next(storedAutosafeState);
  }

  setAutosaveState(enabled: boolean): void {
    this.setAutosaveEnabled(enabled);
    this.autosaveEnabled.next(enabled);
  }

  getAutosaveState(): boolean {
    return this.autosaveEnabled.getValue();
  }

  private setAutosaveEnabled(enabled: boolean): void {
    this.storageService.setAutosaveEnabled(enabled);
  }

  private isAutosaveEnabled(): boolean {
    return this.storageService.getAutosaveEnabled();
  }
}

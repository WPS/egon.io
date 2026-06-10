import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly showSettingsSignal = signal(false);
  readonly showSettings = this.showSettingsSignal.asReadonly();

  close(): void {
    this.showSettingsSignal.set(false);
  }

  open(): void {
    this.showSettingsSignal.set(true);
  }
}

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly showSettings = signal(false);
  readonly showSettings$ = this.showSettings.asReadonly();

  close(): void {
    this.showSettings.set(false);
  }

  open(): void {
    this.showSettings.set(true);
  }
}

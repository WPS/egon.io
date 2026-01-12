import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly showSettings = new BehaviorSubject(false);
  readonly showSettings$ = this.showSettings.asObservable();

  close(): void {
    this.showSettings.next(false);
  }

  open(): void {
    this.showSettings.next(true);
  }
}

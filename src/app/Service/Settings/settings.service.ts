import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private showSettings = new BehaviorSubject(false);
  showSettings$ = this.showSettings.asObservable();

  close(): void {
    this.showSettings.next(false);
  }

  open(): void {
    this.showSettings.next(true);
  }
}

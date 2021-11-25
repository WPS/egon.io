import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private showSettings = new BehaviorSubject(false);

  public getShowSettings(): Observable<boolean> {
    return this.showSettings.asObservable();
  }

  public close(): void {
    this.showSettings.next(false);
  }

  public open(): void {
    this.showSettings.next(true);
  }
}

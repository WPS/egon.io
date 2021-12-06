import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AUTOSAVE_ACTIVATED_TAG } from '../../Domain/Common/constants';

@Injectable({
  providedIn: 'root',
})
export class AutosaveStateService {
  private autosaveEnabled = new BehaviorSubject<boolean>(false);

  constructor() {
    this.readAutosaveState();
  }

  private readAutosaveState(): void {
    const storedAutosafeState = this.isAutosaveEnabled();
    this.autosaveEnabled.next(storedAutosafeState);
  }

  public setAutosaveState(enabled: boolean): void {
    this.setAutosaveEnabled(enabled);
    this.autosaveEnabled.next(enabled);
  }

  public getAutosaveStateAsObservable(): Observable<boolean> {
    return this.autosaveEnabled.asObservable();
  }

  public getAutosaveState(): boolean {
    return this.autosaveEnabled.getValue();
  }

  private setAutosaveEnabled(enabled: boolean): void {
    localStorage.setItem(AUTOSAVE_ACTIVATED_TAG, JSON.stringify(enabled));
  }

  private isAutosaveEnabled(): boolean {
    return JSON.parse(localStorage.getItem(AUTOSAVE_ACTIVATED_TAG) || 'false');
  }
}

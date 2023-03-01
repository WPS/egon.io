import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { AUTOSAVE_ACTIVATED_TAG, AUTOSAVE_AMOUNT_TAG, AUTOSAVE_INTERVAL_TAG, DEFAULT_AUTOSAVES_INTERVAL, DEFAULT_AUTOSAVES_AMOUNT } from 'src/app/Domain/Common/constants';
import { StorageService } from '../BrowserStorage/storage.service';
import { AutosaveState } from './autosave-state';

@Injectable({
  providedIn: 'root',
})
export class AutosaveStateService {

  private state: AutosaveState = {
    activated: false,
    amount: DEFAULT_AUTOSAVES_AMOUNT,
    interval: DEFAULT_AUTOSAVES_INTERVAL
  };
  private readonly stateSubject = new ReplaySubject<AutosaveState>(1);
  readonly state$ = this.stateSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.initializeState();
  }

  private initializeState() {
    this.state = {
      activated: this.readAutosaveEnabled(),
      amount: this.readAutosaveAmount(),
      interval: this.readAutosaveInterval()
    };
    this.stateSubject.next(this.state);
  }

  setState(state: AutosaveState): boolean {
    try {
      this.writeAutosaveEnabled(state.activated);
      this.writeAutosaveAmount(state.amount);
      this.writeAutosaveInterval(state.interval);
      this.state = state;
      this.stateSubject.next(this.state);
      return true;
    } catch {
      return false;
    }
  }

  private readAutosaveEnabled(): boolean {
    return this.storageService.get(AUTOSAVE_ACTIVATED_TAG) ?? false;
  }

  private readAutosaveAmount(): number {
    return + (this.storageService.get(AUTOSAVE_AMOUNT_TAG) ?? DEFAULT_AUTOSAVES_AMOUNT);
  }

  private readAutosaveInterval(): number {
    return + (this.storageService.get(AUTOSAVE_INTERVAL_TAG) ?? DEFAULT_AUTOSAVES_INTERVAL);
  }

  private writeAutosaveEnabled(value: boolean) {
    this.storageService.set(AUTOSAVE_ACTIVATED_TAG, value);
  }

  private writeAutosaveInterval(value: number) {
    this.storageService.set(AUTOSAVE_INTERVAL_TAG, value);
  }

  private writeAutosaveAmount(value: number) {
    this.storageService.set(AUTOSAVE_AMOUNT_TAG, value);
  }
}

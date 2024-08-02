import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReplayStateService {
  private replayOnSubject = new BehaviorSubject<boolean>(false);

  replayOn$ = this.replayOnSubject.asObservable();

  setReplayState(state: boolean): void {
    this.replayOnSubject.next(state);
  }

  getReplayOn(): boolean {
    return this.replayOnSubject.value;
  }
}

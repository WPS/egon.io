import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReplayStateService {
  private replayOnSubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  public setReplayState(state: boolean): void {
    this.replayOnSubject.next(state);
  }

  public getReplayOn(): boolean {
    return this.replayOnSubject.getValue();
  }

  public getReplayOnObservable(): Observable<boolean> {
    return this.replayOnSubject.asObservable();
  }
}

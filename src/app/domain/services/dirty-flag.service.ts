import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DirtyFlagService {
  private readonly isDirtySignal = signal(false);
  readonly dirty = this.isDirtySignal.asReadonly();

  makeDirty(): void {
    this.isDirtySignal.set(true);
  }

  makeClean(): void {
    this.isDirtySignal.set(false);
  }
}

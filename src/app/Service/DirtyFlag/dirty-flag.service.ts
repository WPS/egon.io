import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DirtyFlagService {
  private isDirty = false;
  private isDirtySubject = new BehaviorSubject<boolean>(this.isDirty);

  constructor() {}

  makeDirty(): void {
    this.isDirty = true;
    this.isDirtySubject.next(true);
  }

  makeClean(): void {
    this.isDirty = false;
    this.isDirtySubject.next(false);
  }

  get dirty(): boolean {
    return this.isDirty;
  }

  get dirtySubject(): BehaviorSubject<boolean> {
    return this.isDirtySubject;
  }
}

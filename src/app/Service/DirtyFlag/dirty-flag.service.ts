import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DirtyFlagService {
  private isDirtySubject = new BehaviorSubject<boolean>(false);
  dirty$ = this.isDirtySubject.asObservable();

  makeDirty(): void {
    this.isDirtySubject.next(true);
  }

  makeClean(): void {
    this.isDirtySubject.next(false);
  }

  get dirty(): boolean {
    return this.isDirtySubject.value;
  }
}

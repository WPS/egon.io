import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: string): any {
    const json = localStorage.getItem(key);
    if (json) {
      return JSON.parse(json);
    }
    return null;
  }
}

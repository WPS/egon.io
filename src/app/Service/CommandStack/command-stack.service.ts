import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommandStackService {

  commandStack: any;

  constructor() { }

  setCommandStack(commandStack: any): void {
    this.commandStack = commandStack;
  }
}

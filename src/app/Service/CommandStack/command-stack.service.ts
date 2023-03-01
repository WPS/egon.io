import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommandStackService {
  private commandStack: any;

  constructor() {}

  setCommandStack(commandStack: any): void {
    this.commandStack = commandStack;
  }

  execute(action: string, payload: any) {
    this.commandStack.execute(action, payload);
  }
}

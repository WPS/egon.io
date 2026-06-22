import { Injectable } from '@angular/core';
import { DiagramJsCommandStack } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-command-stack';

@Injectable({
  providedIn: 'root',
})
export class CommandStackService {
  private commandStack: DiagramJsCommandStack | undefined;

  setCommandStack(commandStack: DiagramJsCommandStack): void {
    this.commandStack = commandStack;
  }

  execute(action: string, payload: any) {
    this.commandStack!.execute(action, payload);
  }
}

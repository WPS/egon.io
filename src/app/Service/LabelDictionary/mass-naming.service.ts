import {Injectable} from '@angular/core';
import {ElementRegistryService} from 'src/app/Service/ElementRegistry/element-registry.service';
import {CanvasObject} from 'src/app/Domain/Common/canvasObject';

@Injectable({
  providedIn: 'root',
})
export class MassNamingService {
  private commandStack: any;

  constructor(private elementRegistryService: ElementRegistryService) {
  }

  public setCommandStack(commandStack: any): void {
    this.commandStack = commandStack;
  }

  public massChangeNames(
    oldValue: string,
    newValue: string,
    type: string
  ): void {
    const allRelevantObjects: CanvasObject[] = [];

    this.elementRegistryService.getAllCanvasObjects().forEach((element) => {
      if (
        element.type.includes(type) &&
        element.businessObject.name === oldValue
      ) {
        allRelevantObjects.push(element);
      }
    });

    const context = {
      elements: allRelevantObjects,
      newValue,
    };

    this.commandStack.execute('domainStoryObjects.massRename', context);
  }
}

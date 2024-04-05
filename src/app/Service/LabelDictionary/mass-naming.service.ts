import { Injectable } from '@angular/core';
import { ElementRegistryService } from 'src/app/Service/ElementRegistry/element-registry.service';
import { CanvasObject } from 'src/app/Domain/Common/canvasObject';
import { elementTypes } from '../../Domain/Common/elementTypes';
import { CommandStackService } from '../CommandStack/command-stack.service';

@Injectable({
  providedIn: 'root',
})
export class MassNamingService {
  constructor(
    private elementRegistryService: ElementRegistryService,
    private commandStackService: CommandStackService,
  ) {}

  massChangeNames(
    oldValue: string,
    newValue: string,
    type: elementTypes,
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

    this.commandStackService.execute('domainStoryObjects.massRename', context);
  }
}

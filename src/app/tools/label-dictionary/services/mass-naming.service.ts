import { Injectable } from '@angular/core';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { CanvasObject } from 'src/app/domain/entities/canvasObject';
import { ElementTypes } from '../../../domain/entities/elementTypes';
import { CommandStackService } from '../../modeler/services/command-stack.service';

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
    type: ElementTypes,
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

import { inject, Injectable } from '@angular/core';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { CanvasObject } from 'src/app/domain/entities/canvas-object';
import { ElementTypes } from 'src/app/domain/entities/element-types';
import { CommandStackService } from 'src/app/tools/modeler/services/command-stack.service';

@Injectable({
  providedIn: 'root',
})
export class MassNamingService {
  private readonly elementRegistryService = inject(ElementRegistryService);
  private readonly commandStackService = inject(CommandStackService);

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

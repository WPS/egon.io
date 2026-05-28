import { inject, Injectable } from '@angular/core';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';
import { ElementTypes } from '../../../domain/entities/elementTypes';
import { TitleService } from '../../title/services/title.service';
import { CommandStackService } from '../../../domain/services/command-stack.service';

import activityUpdateHandler from 'src/app/tools/modeler/diagram-js/features/updateHandler/activityUpdateHandlers';

import massRenameHandler from 'src/app/tools/modeler/diagram-js/features/updateHandler/massRenameHandler';
import elementUpdateHandler from 'src/app/tools/modeler/diagram-js/features/updateHandler/elementUpdateHandler';
import headlineAndDescriptionUpdateHandler from 'src/app/tools/modeler/diagram-js/features/updateHandler/headlineAndDescriptionUpdateHandler';
import { ReplayService } from '../../replay/services/replay.service';
import { ActivityClickHandlerService } from 'src/app/tools/modeler/services/activity-click-handler.service';
import { CopyPasteService } from 'src/app/tools/modeler/services/copy-paste.service';

@Injectable({
  providedIn: 'root',
})
export class InitializerService {
  private readonly elementRegistryService = inject(ElementRegistryService);
  private readonly replayService = inject(ReplayService);
  private readonly commandStackService = inject(CommandStackService);
  private readonly titleService = inject(TitleService);
  private readonly activityClickHandlerService = inject(
    ActivityClickHandlerService,
  );
  private readonly copyPasteService = inject(CopyPasteService);

  propagateDomainStoryModelerClassesToServices(
    commandStack: any,
    elementRegistry: any,
    contextPad: any,
    palette: any,
    selection: any,
    eventBus: any,
  ): void {
    this.commandStackService.setCommandStack(commandStack);
    this.elementRegistryService.setElementRegistry(elementRegistry);
    this.replayService.setModelerContext(contextPad, palette, selection);
    this.activityClickHandlerService.setModelerContext(eventBus, commandStack);
    this.copyPasteService.setModelerContext(eventBus);
  }

  initializeDomainStoryModelerEventHandlers(
    commandStack: any,
    eventBus: any,
  ): void {
    activityUpdateHandler(commandStack, eventBus);
    massRenameHandler(commandStack, eventBus);
    elementUpdateHandler(commandStack, eventBus);
    headlineAndDescriptionUpdateHandler(commandStack, this.titleService);
  }

  initiateEventBusListeners(eventBus: any): void {
    eventBus.on('element.dblclick', (event: any) => {
      if (!this.replayService.getReplayOn()) {
        const element = event.element;
        if (element.type === ElementTypes.ACTIVITY) {
          // override the doubleClickListener on activities
          this.activityClickHandlerService.activityDoubleClick(element);
        } else {
          this.activityClickHandlerService.activityNumberDoubleClick(event);
        }
      }
    });

    // while replaying, we only allow editing labels but no other changes (to avoid accidentally modeling on top of hidden model elements)
    eventBus.on(
      [
        'shape.move.start', // move existing shapes
        'bendpoint.move.start', // move and create bendpoints
        'connectionSegment.move.start', // move horizontal/vertical segments of connections
        'element.click', // click on existing element (opens context pad if element is actor or work object)
        'element.hover', // show outline around element
        'interactionEvents.createHit', // use palette to create new element
        'spaceTool.selection.start', // use space tool
        'lasso.selection.start', // use lasso tool
        // TODO:  enable editing of connection labels #217
      ],
      10000000000,
      (event: any) => {
        if (this.replayService.getReplayOn()) {
          event.stopPropagation();
          event.preventDefault();
        }
      },
    );

    eventBus.on('copyPaste.pasteElement', 10000, (event: any) => {
      this.copyPasteService.pasteElement(event);
    });

    eventBus.on('create.end', (event: any) => {
      this.copyPasteService.createEnd(event);
    });
  }
}

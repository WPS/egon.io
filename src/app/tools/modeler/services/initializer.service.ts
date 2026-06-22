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
import { DiagramJsCommandStack } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-command-stack';
import { DiagramJsElementRegistry } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-element-registry';
import { DiagramJsContextPad } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-context-pad';
import { DiagramJsPalette } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-palette';
import { DiagramJsSelection } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-selection';
import { DiagramJsEventBus } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-event-bus';
import {
  EVENT_BENDPOINT_MOVE_START,
  EVENT_CONNECTION_SEGMENT_MOVE_START,
  EVENT_COPY_PASE_PASTE_ELEMENT,
  EVENT_CREATE_END,
  EVENT_ELEMENT_CLICK,
  EVENT_ELEMENT_DBLCLICK,
  EVENT_ELEMENT_HOVER,
  EVENT_INTERACTION_EVENTS_CREATE_HIT,
  EVENT_LASSO_SELECTION_START,
  EVENT_SHAPE_MOVE_START,
  EVENT_SPACE_TOOL_SELECTION_START,
} from 'src/app/tools/modeler/diagram-js/features/diagramJSConstants';

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
    commandStack: DiagramJsCommandStack,
    elementRegistry: DiagramJsElementRegistry,
    contextPad: DiagramJsContextPad,
    palette: DiagramJsPalette,
    selection: DiagramJsSelection,
    eventBus: DiagramJsEventBus,
  ): void {
    this.commandStackService.setCommandStack(commandStack);
    this.elementRegistryService.setElementRegistry(elementRegistry);
    this.replayService.setModelerContext(contextPad, palette, selection);
    this.activityClickHandlerService.setModelerContext(eventBus);
    this.copyPasteService.setModelerContext(eventBus);
  }

  initializeDomainStoryModelerEventHandlers(
    commandStack: DiagramJsCommandStack,
    eventBus: DiagramJsEventBus,
  ): void {
    activityUpdateHandler(commandStack, eventBus);
    massRenameHandler(commandStack, eventBus);
    elementUpdateHandler(commandStack, eventBus);
    headlineAndDescriptionUpdateHandler(commandStack, this.titleService);
  }

  initiateEventBusListeners(eventBus: DiagramJsEventBus): void {
    eventBus.on(EVENT_ELEMENT_DBLCLICK, (event: any) => {
      if (!this.replayService.replayOn()) {
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
        EVENT_SHAPE_MOVE_START,
        EVENT_BENDPOINT_MOVE_START,
        EVENT_CONNECTION_SEGMENT_MOVE_START,
        EVENT_ELEMENT_CLICK,
        EVENT_ELEMENT_HOVER,
        EVENT_INTERACTION_EVENTS_CREATE_HIT,
        EVENT_SPACE_TOOL_SELECTION_START,
        EVENT_LASSO_SELECTION_START,
        // TODO:  enable editing of connection labels #217
      ],
      10000000000,
      (event: any) => {
        if (this.replayService.replayOn()) {
          event.stopPropagation();
          event.preventDefault();
        }
      },
    );

    eventBus.on(EVENT_COPY_PASE_PASTE_ELEMENT, 10000, (event: any) => {
      this.copyPasteService.pasteElement(event);
    });

    eventBus.on(EVENT_CREATE_END, (event: any) => {
      this.copyPasteService.createEnd(event);
    });
  }
}

import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { signal } from '@angular/core';

import { InitializerService } from './initializer.service';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { CommandStackService } from 'src/app/tools/modeler/services/command-stack.service';
import { ReplayService } from '../../replay/services/replay.service';
import { ActivityClickHandlerService } from 'src/app/tools/activity/services/activity-click-handler.service';
import { CopyPasteService } from 'src/app/tools/modeler/services/copy-paste.service';
import { ElementTypes } from 'src/app/domain/entities/element-types';
import activityUpdateHandler from 'src/app/tools/modeler/diagram-js/features/updateHandler/activityUpdateHandlers';
import massRenameHandler from 'src/app/tools/modeler/diagram-js/features/updateHandler/massRenameHandler';
import elementUpdateHandler from 'src/app/tools/modeler/diagram-js/features/updateHandler/elementUpdateHandler';
import headlineAndDescriptionUpdateHandler from 'src/app/tools/modeler/diagram-js/features/updateHandler/headlineAndDescriptionUpdateHandler';
import {
  EVENT_COPY_PASE_PASTE_ELEMENT,
  EVENT_CREATE_END,
  EVENT_ELEMENT_DBLCLICK,
  EVENT_SHAPE_MOVE_START,
} from 'src/app/tools/modeler/diagram-js/features/diagramJSConstants';

jest.mock(
  'src/app/tools/modeler/diagram-js/features/updateHandler/activityUpdateHandlers',
  () => ({ __esModule: true, default: jest.fn() }),
);
jest.mock(
  'src/app/tools/modeler/diagram-js/features/updateHandler/massRenameHandler',
  () => ({ __esModule: true, default: jest.fn() }),
);
jest.mock(
  'src/app/tools/modeler/diagram-js/features/updateHandler/elementUpdateHandler',
  () => ({ __esModule: true, default: jest.fn() }),
);
jest.mock(
  'src/app/tools/modeler/diagram-js/features/updateHandler/headlineAndDescriptionUpdateHandler',
  () => ({ __esModule: true, default: jest.fn() }),
);

describe('InitializerService', () => {
  let service: InitializerService;
  let elementRegistryServiceSpy: jest.Mocked<ElementRegistryService>;
  let commandStackServiceSpy: jest.Mocked<CommandStackService>;
  let replayServiceSpy: jest.Mocked<ReplayService>;
  let activityClickHandlerSpy: jest.Mocked<ActivityClickHandlerService>;
  let copyPasteServiceSpy: jest.Mocked<CopyPasteService>;
  let propertiesService: PropertiesService;

  const replayOnSignal = signal(false);

  beforeEach(() => {
    jest.clearAllMocks();
    replayOnSignal.set(false);

    TestBed.configureTestingModule({
      providers: [
        MockProvider(ElementRegistryService),
        MockProvider(CommandStackService),
        MockProvider(ActivityClickHandlerService),
        MockProvider(CopyPasteService),
        MockProvider(ReplayService, { replayOn: replayOnSignal }),
        PropertiesService,
      ],
    });

    service = TestBed.inject(InitializerService);
    elementRegistryServiceSpy = TestBed.inject(
      ElementRegistryService,
    ) as jest.Mocked<ElementRegistryService>;
    commandStackServiceSpy = TestBed.inject(
      CommandStackService,
    ) as jest.Mocked<CommandStackService>;
    replayServiceSpy = TestBed.inject(
      ReplayService,
    ) as jest.Mocked<ReplayService>;
    activityClickHandlerSpy = TestBed.inject(
      ActivityClickHandlerService,
    ) as jest.Mocked<ActivityClickHandlerService>;
    copyPasteServiceSpy = TestBed.inject(
      CopyPasteService,
    ) as jest.Mocked<CopyPasteService>;
    propertiesService = TestBed.inject(PropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('propagateDomainStoryModelerClassesToServices should wire every service', () => {
    const commandStack = {} as any;
    const elementRegistry = {} as any;
    const contextPad = {} as any;
    const palette = {} as any;
    const selection = {} as any;
    const eventBus = {} as any;

    service.propagateDomainStoryModelerClassesToServices(
      commandStack,
      elementRegistry,
      contextPad,
      palette,
      selection,
      eventBus,
    );

    expect(commandStackServiceSpy.setCommandStack).toHaveBeenCalledWith(
      commandStack,
    );
    expect(elementRegistryServiceSpy.setElementRegistry).toHaveBeenCalledWith(
      elementRegistry,
    );
    expect(replayServiceSpy.setModelerContext).toHaveBeenCalledWith(
      contextPad,
      palette,
      selection,
    );
    expect(activityClickHandlerSpy.setModelerContext).toHaveBeenCalledWith(
      eventBus,
    );
    expect(copyPasteServiceSpy.setModelerContext).toHaveBeenCalledWith(
      eventBus,
    );
  });

  it('initializeDomainStoryModelerEventHandlers should register every update handler', () => {
    const commandStack = {} as any;
    const eventBus = {} as any;

    service.initializeDomainStoryModelerEventHandlers(commandStack, eventBus);

    expect(activityUpdateHandler).toHaveBeenCalledWith(commandStack, eventBus);
    expect(massRenameHandler).toHaveBeenCalledWith(commandStack, eventBus);
    expect(elementUpdateHandler).toHaveBeenCalledWith(commandStack, eventBus);
    expect(headlineAndDescriptionUpdateHandler).toHaveBeenCalledWith(
      commandStack,
      propertiesService,
    );
  });

  describe('initiateEventBusListeners', () => {
    let eventBus: { on: jest.Mock };

    /** Return the callback (last function argument) registered for an event. */
    function callbackFor(event: string): (...args: any[]) => void {
      const call = eventBus.on.mock.calls.find((c) => c[0] === event);
      return call![call!.length - 1];
    }

    beforeEach(() => {
      eventBus = { on: jest.fn() };
      service.initiateEventBusListeners(eventBus as any);
    });

    it('should register listeners for the relevant events', () => {
      const events = eventBus.on.mock.calls.map((c) => c[0]);
      expect(events).toContain(EVENT_ELEMENT_DBLCLICK);
      expect(events).toContain(EVENT_COPY_PASE_PASTE_ELEMENT);
      expect(events).toContain(EVENT_CREATE_END);
    });

    it('double-clicking an activity opens the activity dialog', () => {
      replayOnSignal.set(false);
      const element = { type: ElementTypes.ACTIVITY };

      callbackFor(EVENT_ELEMENT_DBLCLICK)({ element });

      expect(activityClickHandlerSpy.activityDoubleClick).toHaveBeenCalledWith(
        element,
      );
    });

    it('double-clicking a non-activity delegates to the number handler', () => {
      replayOnSignal.set(false);
      const event = { element: { type: ElementTypes.ACTOR } };

      callbackFor(EVENT_ELEMENT_DBLCLICK)(event);

      expect(
        activityClickHandlerSpy.activityNumberDoubleClick,
      ).toHaveBeenCalledWith(event);
    });

    it('double-click is ignored while replaying', () => {
      replayOnSignal.set(true);

      callbackFor(EVENT_ELEMENT_DBLCLICK)({
        element: { type: ElementTypes.ACTIVITY },
      });

      expect(
        activityClickHandlerSpy.activityDoubleClick,
      ).not.toHaveBeenCalled();
    });

    it('blocks interaction events while replaying', () => {
      replayOnSignal.set(true);
      const event = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
      };

      // the interaction-blocking listener is registered with a priority argument
      const call = eventBus.on.mock.calls.find(
        (c) => Array.isArray(c[0]) && c[0].includes(EVENT_SHAPE_MOVE_START),
      );
      call![2](event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('does not block interaction events when not replaying', () => {
      replayOnSignal.set(false);
      const event = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
      };

      const call = eventBus.on.mock.calls.find(
        (c) => Array.isArray(c[0]) && c[0].includes(EVENT_SHAPE_MOVE_START),
      );
      call![2](event);

      expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    it('forwards paste and create-end events to the copy-paste service', () => {
      const pasteEvent = { descriptor: {} };
      const createEvent = { elements: {} };

      callbackFor(EVENT_COPY_PASE_PASTE_ELEMENT)(pasteEvent);
      callbackFor(EVENT_CREATE_END)(createEvent);

      expect(copyPasteServiceSpy.pasteElement).toHaveBeenCalledWith(pasteEvent);
      expect(copyPasteServiceSpy.createEnd).toHaveBeenCalledWith(createEvent);
    });
  });
});

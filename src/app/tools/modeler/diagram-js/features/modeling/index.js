'use strict';

import DomainStoryPalette from '../palette/domainStoryPalette';
import CreateModule from 'diagram-js/lib/features/create';
import Connect from 'diagram-js/lib/features/connect';
import Translate from 'diagram-js/lib/i18n/translate';
import ContextPadModule from 'diagram-js/lib/features/context-pad';
import PopupMenu from 'diagram-js/lib/features/popup-menu';
import CommandStack from 'diagram-js/lib/command/CommandStack';
import UpdateLabelHandler from '../updateHandler/updateLabelHandler';
import DomainStoryUpdater from '../domainStoryUpdater';
import DomainStoryElementFactory from '../domainStoryElementFactory';
import headlineAndDescriptionUpdateHandler from '../updateHandler/headlineAndDescriptionUpdateHandler';
import DomainStoryRenderer from '../domainStoryRenderer';
import DSModeling from './dSModeling';
import DomainStoryRules from '../domainStoryRules';
import ReplaceMenuProvider from '../change-icon/replaceMenuProvider';
import DomainStoryContextPadProvider from '../context-pad/domainStoryContextPadProvider';

export default {
  __depends__: [CreateModule, ContextPadModule, Connect, Translate, PopupMenu],
  __init__: [
    'domainStoryRenderer',
    'paletteProvider',
    'domainStoryRules',
    'domainStoryUpdater',
    'contextPadProvider',
    'replaceMenuProvider',
  ],
  elementFactory: ['type', DomainStoryElementFactory],
  domainStoryRenderer: ['type', DomainStoryRenderer],
  paletteProvider: ['type', DomainStoryPalette],
  domainStoryRules: ['type', DomainStoryRules],
  domainStoryUpdater: ['type', DomainStoryUpdater],
  contextPadProvider: ['type', DomainStoryContextPadProvider],
  replaceMenuProvider: ['type', ReplaceMenuProvider],
  commandStack: ['type', CommandStack],
  updateLabelHandler: ['type', UpdateLabelHandler],
  headlineAndDescriptionUpdateHandler: [
    'type',
    headlineAndDescriptionUpdateHandler,
  ],
  modeling: ['type', DSModeling],
};

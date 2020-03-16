'use strict';

import DomainStoryElementFactory from './DomainStoryElementFactory';
import DomainStoryRenderer from '../language/DomainStoryRenderer';
import DomainStoryPalette from '../features/palette/DomainStoryPalette';
import DomainStoryRules from '../language/DomainStoryRules';
import DomainStoryUpdater from './DomainStoryUpdater';
import DomainStoryContextPadProvider from '../features/context-pad/DomainStoryContextPadProvider';
import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory';
import CreateModule from 'diagram-js/lib/features/create';
import PathMap from 'bpmn-js/lib/draw/PathMap';
import PopupMenuModule from 'bpmn-js/lib/features/popup-menu';
import ReplaceMenuProvider from '../features/change-icon/ReplaceMenuProvider';
import ContextPadModule from 'diagram-js/lib/features/context-pad';
import CommandStack from '../../../node_modules/diagram-js/lib/command/CommandStack';
import DSModeling from '../features/modeling/DSModeling';
import DSUpdateLabelHandler from '../features/labeling/DSUpdateLabelHandler';
import headlineAndDescriptionUpdateHandler from '../modeler/UpdateHandler/headlineAndDescriptionUpdateHandler';


export default {
  __depends__:[
    CreateModule,
    ContextPadModule,
    PopupMenuModule
  ],
  __init__: [
    'domainStoryRenderer',
    'paletteProvider',
    'domainStoryRules',
    'domainStoryUpdater',
    'contextPadProvider',
    'replaceMenuProvider',
  ],
  elementFactory: [ 'type', DomainStoryElementFactory ],
  domainStoryRenderer: [ 'type', DomainStoryRenderer ],
  paletteProvider: [ 'type', DomainStoryPalette ],
  domainStoryRules: [ 'type', DomainStoryRules ],
  domainStoryUpdater: [ 'type', DomainStoryUpdater ],
  contextPadProvider: [ 'type', DomainStoryContextPadProvider ],
  elementFactoryBpmn: ['type', ElementFactory],
  pathMap: [ 'type', PathMap ],
  replaceMenuProvider: ['type', ReplaceMenuProvider],
  commandStack: ['type', CommandStack],
  dSUpdateLabelHandler: ['type', DSUpdateLabelHandler],
  headlineAndDescriptionUpdateHandler: ['type', headlineAndDescriptionUpdateHandler],
  modeling : ['type', DSModeling]
};

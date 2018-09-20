import DomainStoryElementFactory from './DomainStoryElementFactory';
import DomainStoryRenderer from './DomainStoryRenderer';
import DomainStoryPalette from './DomainStoryPalette';
import DomainStoryRules from './DomainStoryRules';
import DomainStoryUpdater from './DomainStoryUpdater';
import DomainStoryContextPadProvider from './DomainStoryContextPadProvider';
import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory';
import CreateModule from 'diagram-js/lib/features/create';
import PathMap from 'bpmn-js/lib/draw/PathMap';
import PopupMenuModule from 'bpmn-js/lib/features/popup-menu';
import ReplaceMenuProvider from './popup-menu/ReplaceMenuProvider';
import ContextPadModule from 'diagram-js/lib/features/context-pad';
import CommandStack from '../../../node_modules/diagram-js/lib/command/CommandStack';
import DSModeling from './modeling/DSModeling';


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
  modeling : ['type', DSModeling]
};

import DomainStoryElementFactory from '../domain-story/DomainStoryElementFactory';
import ElementFactory from 'diagram-js/lib/core/ElementFactory';
import CommandStack from 'diagram-js/lib/command/CommandStack';
import ReplaceMenuProvider from '../domain-story/popup-menu/ReplaceMenuProvider';
import DSModeling from '../domain-story/modeling/DSModeling';

'use strict';

export default {
  __depends__:[
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
  elementFactoryBpmn: ['type', ElementFactory],
  replaceMenuProvider: ['type', ReplaceMenuProvider],
  commandStack: ['type', CommandStack],
  modeling : ['type', DSModeling]
};
import ElementFactory from 'diagram-js/lib/core/ElementFactory';
import CommandStack from 'diagram-js/lib/command/CommandStack';
import DSModeling from '../modeling/DSModeling';

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
  elementFactoryBpmn: ['type', ElementFactory],
  commandStack: ['type', CommandStack],
  modeling : ['type', DSModeling]
};
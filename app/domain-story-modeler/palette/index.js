import DomainStoryElementFactory from '../domain-story/DomainStoryElementFactory';
import ElementFactory from 'diagram-js/lib/core/ElementFactory';
import DSModeling from '../domain-story/modeling/DSModeling';

'use strict';

export default {
  __depends__:[
  ],
  __init__: [
    'paletteProvider',
  ],
  elementFactory: [ 'type', DomainStoryElementFactory ],
  elementFactoryBpmn: ['type', ElementFactory],
  modeling : ['type', DSModeling]
};
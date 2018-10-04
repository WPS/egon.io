'use strict';

import PopupMenuModule from 'diagram-js/lib/features/popup-menu';
import ReplaceModule from 'bpmn-js/lib/features/replace';
import DSModeling from '../modeling/DSModeling';

import ReplaceMenuProvider from './ReplaceMenuProvider';


export default {
  __depends__: [
    PopupMenuModule,
    ReplaceModule
  ],
  __init__: [ 'replaceMenuProvider' ],
  replaceMenuProvider: [ 'type', ReplaceMenuProvider ],
  modeling: [ 'type', DSModeling ],
};
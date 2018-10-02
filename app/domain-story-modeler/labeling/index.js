'use strict';

import ChangeSupportModule from 'diagram-js/lib/features/change-support';
import ResizeModule from 'diagram-js/lib/features/resize';
import DirectEditingModule from 'diagram-js-direct-editing';

import DSModeling from '../domain-story/modeling/DSModeling';
import CommandStack from 'diagram-js/lib/command/CommandStack';
import DSUpdateLabelHandler from '../domain-story/label-editing/cmd/DSUpdateLabelHandler';
import DSLabelEditingPreview from './DSLabelEditingPreview';
import DSLabelEditingProvider from './DSLabelEditingProvider';



export default {
  __depends__: [
    ChangeSupportModule,
    ResizeModule,
    DirectEditingModule
  ],
  __init__: [
    'dSlabelEditingProvider',
    'dSlabelEditingPreview'
  ],
  dSlabelEditingProvider: [ 'type', DSLabelEditingProvider ],
  dSlabelEditingPreview: [ 'type', DSLabelEditingPreview ],
  dSUpdateLabelHandler: ['type', DSUpdateLabelHandler],
  commandStack: ['type', CommandStack],
  modeling: [ 'type ', DSModeling]
};

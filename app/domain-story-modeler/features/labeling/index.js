'use strict';

import ChangeSupportModule from 'diagram-js/lib/features/change-support';
import ResizeModule from 'diagram-js/lib/features/resize';
import DirectEditingModule from 'diagram-js-direct-editing';

import CommandStack from 'diagram-js/lib/command/CommandStack';
import DSUpdateLabelHandler from '../labeling/DSUpdateLabelHandler';
import DSLabelEditingPreview from './DSLabelEditingPreview';
import DSLabelEditingProvider from './DSLabelEditingProvider';
import DSModeling from '../modeling/DSModeling';



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

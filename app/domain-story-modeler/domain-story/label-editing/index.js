'use strict';

import ChangeSupportModule from 'diagram-js/lib/features/change-support';
import ResizeModule from 'diagram-js/lib/features/resize';
import DirectEditingModule from 'diagram-js-direct-editing';

import DSLabelEditingProvider from './DSLabelEditingProvider';
import DSLabelEditingPreview from './DSLabelEditingPreview';
import DSModeling from '../modeling/DSModeling';
import DSUpdateLabelHandler from './cmd/DSUpdateLabelHandler';
import CommandStack from 'diagram-js/lib/command/CommandStack';


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

'use strict';

import ChangeSupportModule from 'diagram-js/lib/features/change-support';
import ResizeModule from 'diagram-js/lib/features/resize';
import DirectEditingModule from 'diagram-js-direct-editing';

import DSLabelEditingProvider from './DSLabelEditingProvider';
import DSLabelEditingPreview from './DSLabelEditingPreview';
import DSUpdateLabelHandler from './cmd/DSUpdateLabelHandler';
import DSModeling from '../modeling/DSModeling';


export default {
  __depends__: [
    ChangeSupportModule,
    ResizeModule,
    DirectEditingModule
  ],
  __init__: [
    'dSlabelEditingProvider',
    'dSlabelEditingPreview',
    'dSupdateLabelHandler'
  ],
  dSlabelEditingProvider: [ 'type', DSLabelEditingProvider ],
  dSlabelEditingPreview: [ 'type', DSLabelEditingPreview ],
  dSupdateLabelHandler: [ 'type', DSUpdateLabelHandler],
  modeling: [ 'type ', DSModeling]
};

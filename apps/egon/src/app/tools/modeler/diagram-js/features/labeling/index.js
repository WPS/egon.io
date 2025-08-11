'use strict';

import ChangeSupportModule from 'diagram-js/lib/features/change-support';
import ResizeModule from 'diagram-js/lib/features/resize';
import DirectEditingModule from 'diagram-js-direct-editing';

import CommandStack from 'diagram-js/lib/command/CommandStack';
import UpdateLabelHandler from '../updateHandler/updateLabelHandler';
import DSLabelEditingPreview from './dsLabelEditingPreview';
import DSLabelEditingProvider from './dsLabelEditingProvider';
import DSModeling from '../modeling/dSModeling';

export default {
  __depends__: [ChangeSupportModule, ResizeModule, DirectEditingModule],
  __init__: ['dSlabelEditingProvider', 'dSlabelEditingPreview'],
  dSlabelEditingProvider: ['type', DSLabelEditingProvider],
  dSlabelEditingPreview: ['type', DSLabelEditingPreview],
  updateLabelHandler: ['type', UpdateLabelHandler],
  commandStack: ['type', CommandStack],
  modeling: ['type ', DSModeling],
};

'use strict';

import BehaviorModule from 'bpmn-js/lib/features/modeling/behavior';
import OrderingModule from 'bpmn-js/lib/features/ordering';
import ReplaceModule from 'bpmn-js/lib/features/replace';

import CommandModule from 'diagram-js/lib/command';
import TooltipsModule from 'diagram-js/lib/features/tooltips';
import LabelSupportModule from 'diagram-js/lib/features/label-support';
import AttachSupportModule from 'diagram-js/lib/features/attach-support';
import SelectionModule from 'diagram-js/lib/features/selection';
import ChangeSupportModule from 'diagram-js/lib/features/change-support';
import SpaceToolModule from 'diagram-js/lib/features/space-tool';

import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory';
import BpmnUpdater from 'bpmn-js/lib/features/modeling/BpmnUpdater';
import BpmnLayouter from 'bpmn-js/lib/features/modeling/BpmnLayouter';
import CroppingConnectionDocking from 'diagram-js/lib/layout/CroppingConnectionDocking';


import DSModeling from './DSModeling';
import DomainStoryRules from '../../language/DomainStoryRules';
import DomainStoryElementFactory from '../../modeler/DomainStoryElementFactory';

export default {
  __init__: [
    'modeling',
    'bpmnUpdater'
  ],
  __depends__: [
    BehaviorModule,
    OrderingModule,
    ReplaceModule,
    CommandModule,
    TooltipsModule,
    LabelSupportModule,
    AttachSupportModule,
    SelectionModule,
    ChangeSupportModule,
    SpaceToolModule
  ],
  domainStoryRules: ['type', DomainStoryRules],
  bpmnFactory: [ 'type', BpmnFactory ],
  bpmnUpdater: [ 'type', BpmnUpdater ],
  layouter: [ 'type', BpmnLayouter ],
  elementFactory: [ 'type', DomainStoryElementFactory ],
  modeling: [ 'type', DSModeling ],
  connectionDocking: [ 'type', CroppingConnectionDocking ]
};

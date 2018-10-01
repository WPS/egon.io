'use strict';

import Modeling from 'bpmn-js/lib/features/modeling/Modeling';

import { inherits } from 'util';

export default function DSModeling(eventBus, elementFactory, commandStack,
    domainStoryRules) {
  Modeling.call(this, eventBus, elementFactory, commandStack, domainStoryRules);
}

Modeling.prototype.replaceShape = function(oldShape, newShape, hints) {
  var context = {
    oldShape: oldShape,
    newData: newShape,
    hints: hints || {}
  };

  this._commandStack.execute('shape.replace', context);
  return context.newShape;
};

inherits(DSModeling, Modeling);

DSModeling.$inject = [
  'eventBus',
  'elementFactory',
  'commandStack',
  'domainStoryRules'
];

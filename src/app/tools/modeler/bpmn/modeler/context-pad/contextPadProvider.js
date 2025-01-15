import {
  assign,
  isArray
} from 'min-dash';

import {
  hasPrimaryModifier
} from 'diagram-js/lib/util/Mouse';

export default function ContextPadProvider(
  eventBus, contextPad, modeling, rules, translate) {

  contextPad.registerProvider(this);

  this._modeling = modeling;
  this._rules = rules;
  this._translate = translate;

  eventBus.on('create.end', 250, function(event) {
    var context = event.context,
      shape = context.shape;

    if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
      return;
    }

    var entries = contextPad.getEntries(shape);

    if (entries.replace) {
      entries.replace.action.click(event, shape);
    }
  });
}

ContextPadProvider.$inject = [
  'eventBus',
  'contextPad',
  'modeling',
  'rules',
  'translate'
];

ContextPadProvider.prototype.getContextPadEntries = function(element) {

  var modeling = this._modeling,
    rules = this._rules,
    translate = this._translate;

  var actions = {};

  function removeElement(e) {
    modeling.removeElements([ element ]);
  }

  // delete element entry, only show if allowed by rules
  var deleteAllowed = rules.allowed('elements.delete', { elements: [ element ] });

  if (isArray(deleteAllowed)) {
    // was the element returned as a deletion candidate?
    deleteAllowed = deleteAllowed[0] === element;
  }

  if (deleteAllowed) {
    assign(actions, {
      'delete': {
        group: 'edit',
        className: 'bpmn-icon-trash',
        title: translate('Remove'),
        action: {
          click: removeElement
        }
      }
    });
  }
  return actions;
};

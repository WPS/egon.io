import inherits from 'inherits-browser';

import KeyboardBindings from 'diagram-js/lib/features/keyboard/KeyboardBindings';

export default function AdditionalKeyboardBindings(injector) {
  injector.invoke(KeyboardBindings, this);
}

inherits(AdditionalKeyboardBindings, KeyboardBindings);

AdditionalKeyboardBindings.$inject = [
  'injector'
];

AdditionalKeyboardBindings.prototype.registerBindings = function(keyboard, editorActions) {

  // inherit default bindings
  KeyboardBindings.prototype.registerBindings.call(this, keyboard, editorActions);

  function addListener(action, fn) {

    if (editorActions.isRegistered(action)) {
      keyboard.addListener(fn);
    }
  }

  // select all elements
  // CTRL + A
  addListener('selectElements', function(context) {

    var event = context.keyEvent;

    if (keyboard.isKey([ 'a', 'A' ], event) && keyboard.isCmd(event)) {
      editorActions.trigger('selectElements');

      return true;
    }
  });

  // activate space tool
  // S
  addListener('spaceTool', function(context) {

    var event = context.keyEvent;

    if (keyboard.hasModifier(event)) {
      return;
    }

    if (keyboard.isKey([ 's', 'S' ], event)) {
      editorActions.trigger('spaceTool');

      return true;
    }
  });

  // activate lasso tool
  // L
  addListener('lassoTool', function(context) {

    var event = context.keyEvent;

    if (keyboard.hasModifier(event)) {
      return;
    }

    if (keyboard.isKey([ 'l', 'L' ], event)) {
      editorActions.trigger('lassoTool');

      return true;
    }
  });

  // activate hand tool
  // H
  addListener('handTool', function(context) {

    var event = context.keyEvent;

    if (keyboard.hasModifier(event)) {
      return;
    }

    if (keyboard.isKey([ 'h', 'H' ], event)) {
      editorActions.trigger('handTool');

      return true;
    }
  });

  // activate direct editing
  // E
  addListener('directEditing', function(context) {

    var event = context.keyEvent;

    if (keyboard.hasModifier(event)) {
      return;
    }

    if (keyboard.isKey([ 'e', 'E' ], event)) {
      editorActions.trigger('directEditing');

      return true;
    }
  });

};

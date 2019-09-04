'use strict';

import Replace from './Replace';

import * as replaceOptions from './ReplaceOptions';

import { forEach } from 'min-dash';

/**
 * This module is an element agnostic replace menu provider for the popup menu.
 */
export default function ReplaceMenuProvider(modeling) {
  this._dsReplace = new Replace(modeling);
  this._modeling = modeling;
}

ReplaceMenuProvider.$inject = ['modeling'];

/**
 * Get all entries from replaceOptions for the given element and apply filters
 * on them. Get for example only elements, which are different from the current one.
 *
 * @param {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu entry items
 */
ReplaceMenuProvider.prototype.getEntries = function(element) {

  let entries;
  if (element.type.includes('actor')) {
    entries = replaceOptions.actorReplaceOptions(element.type);
  }
  else if (element.type.includes('workObject')) {
    entries = replaceOptions.workObjectReplaceOptions(element.type);
  }

  return this._createEntries(element, entries);
};

/**
 * Creates an array of menu entry objects for a given element and filters the replaceOptions
 * according to a filter function.
 *
 * @param  {djs.model.Base} element
 * @param  {Object} replaceOptions
 *
 * @return {Array<Object>} a list of menu items
 */
ReplaceMenuProvider.prototype._createEntries = function(element, replaceOptions) {
  let menuEntries = [];

  let self = this;

  forEach(replaceOptions, function(definition) {
    let entry = self._createMenuEntry(definition, element);

    menuEntries.push(entry);
  });

  return menuEntries;
};

/**
 * Creates and returns a single menu entry item.
 *
 * @param  {Object} definition a single replace options definition object
 * @param  {djs.model.Base} element
 * @param  {Function} [action] an action callback function which gets called when
 *                             the menu entry is being triggered.
 *
 * @return {Object} menu entry item
 */
ReplaceMenuProvider.prototype._createMenuEntry = function(definition, element, action) {
  let replaceElement = this._dsReplace.replaceElement;
  let modeling = this._modeling;
  let replaceAction = function() {
    return replaceElement(element, definition.target, modeling);
  };

  action = action || replaceAction;

  let menuEntry = {
    label: definition.label,
    className: definition.className,
    id: definition.actionName,
    action: action
  };

  return menuEntry;
};
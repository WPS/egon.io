'use strict';

import { assign } from 'min-dash';
import { getNameFromType } from '../../language/naming';
import { getIconForType } from '../../language/icon/iconDictionary';
import { getIconset } from '../../language/icon/iconConfig';
import { GROUP, ACTOR, WORKOBJECT } from '../../language/elementTypes';
import { appendedIconsTag } from '../iconSetCustomization/persitence';
import { overrideAppendedIcons } from '../../language/icon/all_Icons';
import {
  initTypeDictionaries,
  getTypeDictionary
} from '../../language/icon/dictionaries';
import { domExists } from '../../language/testmode';

/**
 * A palette that allows you to create BPMN _and_ custom elements.
 */

export default function PaletteProvider(
    palette,
    create,
    elementFactory,
    spaceTool,
    lassoTool
) {
  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;

  palette.registerProvider(this);
}

PaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'modeling'
];

PaletteProvider.prototype.getPaletteEntries = function() {
  let actions = {},
      create = this._create,
      elementFactory = this._elementFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool;

  function createAction(type, group, className, title, options) {
    function createListener(event) {
      let shape = elementFactory.createShape(assign({ type: type }, options));

      assign(shape.businessObject, {
        id: shape.id
      });

      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }

      create.start(event, shape);
    }

    let shortType = type.replace(/^domainStory:/, '');

    return {
      group: group,
      className: className,
      title: 'Create ' + title || 'Create ' + shortType,
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  return initPalette(actions, spaceTool, lassoTool, createAction);
};

function appendCSSStyleCheat(customIcons) {
  const sheetEl = document.createElement('style');
  document.head.appendChild(sheetEl);

  let dictionary = require('collections/dict');
  let customIconDict = new dictionary();

  customIconDict.addEach(customIcons);
  let customIconDictKeys = customIconDict.keysArray();

  customIconDictKeys.forEach(name => {
    const src = customIconDict.get(name);
    const iconStyle =
      '.icon-domain-story-' +
      name.toLowerCase() +
      '::before{' +
      'content: url("' +
      src +
      '"); margin: 3px; height: 22px !important; width: 22px !important;}'; // TODO change style such that important is not necessarcy
    sheetEl.sheet.insertRule(iconStyle, sheetEl.sheet.cssRules.length);
  });
}

function initPalette(actions, spaceTool, lassoTool, createAction) {
  let config = getIconset();

  let customIcons = localStorage.getItem(appendedIconsTag);
  if (customIcons) {
    customIcons = JSON.parse(customIcons);
    overrideAppendedIcons(customIcons);
    if (domExists()) {
      appendCSSStyleCheat(customIcons);
    }
  }

  initTypeDictionaries(config.actors, config.workObjects);

  let actorTypes = getTypeDictionary(ACTOR);

  actorTypes.keysArray().forEach(actorType => {
    let name = getNameFromType(actorType);
    let icon = getIconForType(actorType);

    let action = [];
    action['domainStory-actor' + name] = createAction(
      actorType,
      'actor',
      icon,
      name
    );
    assign(actions, action);
  });

  assign(actions, {
    'actor-separator': {
      group: 'actor',
      separator: true
    }
  });

  let workObjectTypes = getTypeDictionary(WORKOBJECT);

  workObjectTypes.keysArray().forEach(workObjectType => {
    let name = getNameFromType(workObjectType);
    let icon = getIconForType(workObjectType);

    let action = [];
    action['domainStory-actor' + name] = createAction(
      workObjectType,
      'actor',
      icon,
      name
    );
    assign(actions, action);
  });

  assign(actions, {
    'workObject-separator': {
      group: 'workObject',
      separator: true
    },
    'domainStory-group': createAction(
      GROUP,
      'group',
      'icon-domain-story-tool-group',
      'group'
    ),
    'group-separator': {
      group: 'group',
      separator: true
    },
    'lasso-tool': {
      group: 'tools',
      className: 'bpmn-icon-lasso-tool',
      title: 'Activate the lasso tool',
      action: {
        click: function(event) {
          lassoTool.activateSelection(event);
        }
      }
    },
    'space-tool': {
      group: 'tools',
      className: 'bpmn-icon-space-tool',
      title: 'Activate the create/remove space tool',
      action: {
        click: function(event) {
          spaceTool.activateSelection(event);
        }
      }
    }
  });

  return actions;
}

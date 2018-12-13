import { registerIcon } from './icons';

'use strict';

var WorkObjectTypes = require('collections/dict');
var workObjectTypes = new WorkObjectTypes();

export function getWorkObjectTypes() {
  return workObjectTypes;
}

export function getWorkObjectTypeKeys() {
  return workObjectTypes.keysArray();
}

export function registerWorkObjectTypes(name, src) {
  if (!name.includes('domainStory:workObject')) {
    name = 'domainStory:workObject' + name;
  }
  workObjectTypes.set(name, src);
}

export function getWorkObjectSrc(name) {
  return workObjectTypes.get(name);
}

export function initWorkObjectTypes() {
  workObjectTypes.set('domainStory:workObject',
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve"><g id="Header_x2F_BG" display="none"><rect x="-402" y="-270" display="inline" fill="#F1F1F2" width="520" height="520"/></g><g id="Bounding_Boxes"><g id="ui_x5F_spec_x5F_header_copy_3"></g><path fill="none" d="M0,0h24v24H0V0z"/></g><g id="Rounded" display="none"><g id="ui_x5F_spec_x5F_header_copy_5" display="inline"></g><path display="inline" d="M14.59,2.59C14.21,2.21,13.7,2,13.17,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.89,2,1.99,2H18c1.1,0,2-0.9,2-2V8.83c0-0.53-0.21-1.04-0.59-1.41L14.59,2.59z M15,18H9c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h6c0.55,0,1,0.45,1,1v0C16,17.55,15.55,18,15,18z M15,14H9c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h6c0.55,0,1,0.45,1,1v0C16,13.55,15.55,14,15,14z M13,8V3.5L18.5,9H14C13.45,9,13,8.55,13,8z"/></g><g id="Sharp" display="none"><g id="ui_x5F_spec_x5F_header_copy_4" display="inline"></g><path display="inline" d="M14,2H4v20h16V8L14,2z M16,18H8v-2h8V18z M16,14H8v-2h8V14z M13,9V3.5L18.5,9H13z"/></g><g id="Outline"><g id="ui_x5F_spec_x5F_header"></g><g><rect x="8" y="16" width="8" height="2"/><rect x="8" y="12" width="8" height="2"/><path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.89,2,1.99,2H18c1.1,0,2-0.9,2-2V8L14,2z M18,20L6,20V4h7v5h5V20z"/></g></g><g id="Duotone" display="none"><g id="ui_x5F_spec_x5F_header_copy_2" display="inline"></g><g display="inline"><path opacity="0.3" d="M13,4H6v16l12,0V9h-5V4z M16,18H8v-2h8V18z M16,12v2H8v-2H16z"/><g><rect x="8" y="16" width="8" height="2"/><rect x="8" y="12" width="8" height="2"/><path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.89,2,1.99,2H18c1.1,0,2-0.9,2-2V8L14,2z M18,20L6,20V4h7v5h5V20z"/></g></g></g><g id="Fill" display="none"><g id="ui_x5F_spec_x5F_header_copy" display="inline"></g><path display="inline" d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.89,2,1.99,2H18c1.1,0,2-0.9,2-2V8L14,2z M16,18H8v-2h8V18z M16,14H8v-2h8V14z M13,9V3.5L18.5,9H13z"/></g><g id="nyt_x5F_exporter_x5F_info" display="none"></g></svg>');
  registerIcon('domainStory:workObject',
    'icon-domain-story-workObject');
  workObjectTypes.set('domainStory:workObjectFolder',
    '<svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0,0h24v24H0V0z"/><path d="M9.17,6l2,2H20v10L4,18V6H9.17 M10,4H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8c0-1.1-0.9-2-2-2 h-8L10,4L10,4z"/></svg>');
  registerIcon('domainStory:workObjectFolder',
    'icon-domain-story-workObject-folder');
  workObjectTypes.set('domainStory:workObjectCall',
    '<svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0,0h24v24H0V0z"/><path d="M6.54,5C6.6,5.89,6.75,6.76,6.99,7.59l-1.2,1.2C5.38,7.59,5.12,6.32,5.03,5H6.54 M16.4,17.02c0.85,0.24,1.72,0.39,2.6,0.45 v1.49c-1.32-0.09-2.59-0.35-3.8-0.75L16.4,17.02 M7.5,3H4C3.45,3,3,3.45,3,4c0,9.39,7.61,17,17,17c0.55,0,1-0.45,1-1v-3.49	c0-0.55-0.45-1-1-1c-1.24,0-2.45-0.2-3.57-0.57c-0.1-0.04-0.21-0.05-0.31-0.05c-0.26,0-0.51,0.1-0.71,0.29l-2.2,2.2 c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.2C9.1,8.31,9.18,7.92,9.07,7.57C8.7,6.45,8.5,5.25,8.5,4C8.5,3.45,8.05,3,7.5,3L7.5,3z"/></svg>');
  registerIcon('domainStory:workObjectCall',
    'icon-domain-story-workObject-call');
  workObjectTypes.set('domainStory:workObjectEmail',
    '<svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0,0h24v24H0V0z"/><path fill-opacity="0.9" d="M12,1.95c-5.52,0-10,4.48-10,10s4.48,10,10,10h5v-2h-5c-4.34,0-8-3.66-8-8s3.66-8,8-8s8,3.66,8,8v1.43 c0,0.79-0.71,1.57-1.5,1.57S17,14.17,17,13.38v-1.43c0-2.76-2.24-5-5-5s-5,2.24-5,5s2.24,5,5,5c1.38,0,2.64-0.56,3.54-1.47 c0.65,0.89,1.77,1.47,2.96,1.47c1.97,0,3.5-1.6,3.5-3.57v-1.43C22,6.43,17.52,1.95,12,1.95z M12,14.95c-1.66,0-3-1.34-3-3 s1.34-3,3-3s3,1.34,3,3S13.66,14.95,12,14.95z"/></svg>');
  registerIcon('domainStory:workObjectEmail',
    'icon-domain-story-workObject-email');
  workObjectTypes.set('domainStory:workObjectConversation',
    '<svg fill="#000000" height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>');
  registerIcon('domainStory:workObjectConversation',
    'icon-domain-story-workObject-conversation');
  workObjectTypes.set('domainStory:workObjectInfo',
    '<svg fill="#000000" height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/></svg>');
  registerIcon('domainStory:workObjectInfo',
    'icon-domain-story-workObject-info');
}
'use strict';

// sanitize user-Input to be Desktop-Filename safe
export function sanitizeForDesktop(string) {
  const map = {
    '/': '',
    '\\': '',
    ':': '',
    '*': '',
    '?': '',
    '"': '',
    '<': '',
    '>': '',
    '|': ''
  };
  const reg = /[/\\:*?"<>|]/ig;
  return string ? string.replace(reg, (match)=>(map[match])) : '';
}

export function sanitizeIconName(name) {
  const map = {
    '/': '',
    '\\': '',
    ':': '',
    '*': '',
    '?': '',
    '"': '',
    '<': '',
    '>': '',
    '|': '',
    '(': '',
    ')': '',
    ' ': '-'
  };
  const reg = /[/\\:*?"<>|() ]/ig;
  return name ? name.replace(reg, (match)=>(map[match])) : '';
}
'use strict';

// sanitize user-Input to be HTML-safe
export function sanitize(string) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt',
    '"': '&quot;',
    '\'': '&apos;',
  };
  const reg = /[&<>"/]/ig;
  return string ? string.replace(reg, (match)=>(map[match])) : '';
}

// sanitize user-Input to be Desktop-Filename safe
export default function sanitizeForDesktop(string) {
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
  const reg = /[&<>"/]/ig;
  return string ? string.replace(reg, (match)=>(map[match])) : '';
}
'use strict';

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
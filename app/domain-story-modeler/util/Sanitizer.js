'use strict';

// sanitize user-Input to be HTML-safe
export default function sanitize(string) {
  const map = {
    '&': '',
    '<': '',
    '>': '',
    '"': '',
    '/': '',
  };
  const reg = /[&<>"/]/ig;
  return string ? string.replace(reg, (match)=>(map[match])) : '';
}
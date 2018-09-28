'use strict';

export default function sanitize(string) {
  const map = {
    '&': '',
    '<': '',
    '>': '',
    '"': '',
    '\'': '',
    '/': '',
  };
  const reg = /[&<>"'/]/ig;
  return string ? string.replace(reg, (match)=>(map[match])) : '';
}
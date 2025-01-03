'use strict';

export function sanitizeTextForSVGExport(str: string): string {
  // @ts-ignore Typescript does not realize that replaceAll exists, no idea why not.
  return str.replaceAll('--', '––');
}

// sanitize user-Input to be Desktop-Filename safe
export function sanitizeForDesktop(str: string): string {
  const map: { [key: string]: string } = {
    '/': '',
    '\\': '',
    ':': '',
    '*': '',
    '?': '',
    '"': '',
    '<': '',
    '>': '',
    '|': '',
  };
  const reg = /[/\\:*?"<>|]/gi;
  return str
    ? sanitizeTextForSVGExport(str.replace(reg, (match) => map[match]))
    : '';
}

export function sanitizeIconName(name: string): string {
  if (!name) {
    return '';
  }
  let nameWithoutFileEnding =
    name.lastIndexOf('.') > 0 ? name.substring(0, name.lastIndexOf('.')) : name;
  const map: { [key: string]: string } = {
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
    ' ': '-',
  };
  const reg = /[/\\:*?"<>|() ]/gi;
  return nameWithoutFileEnding.trim().replace(reg, (match) => map[match]);
}

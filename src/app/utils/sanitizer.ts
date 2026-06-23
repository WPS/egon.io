'use strict';

export function sanitizeTextForSVGExport(str: string): string {
  return str
    .replaceAll('--', '––')
    .replaceAll('<', '%3C')
    .replaceAll('>', '%3E');
}

export function unsanitizeTextFromSvgExport(str: string): string {
  return str
    .replaceAll('––', '--')
    .replaceAll('&#34;', '"') // External Tools HTML-escape more characters than we do => We need to unescape them
    .replaceAll('&#39;', "'") // External Tools HTML-escape more characters than we do => We need to unescape them
    .replaceAll('&#43;', '+') // External Tools HTML-escape more characters than we do => We need to unescape them
    .replaceAll('&#61;', '=') // External Tools HTML-escape more characters than we do => We need to unescape them
    .replaceAll('%3C', '<')
    .replaceAll('%3E', '>');
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

// CSS-Classes with semantic characters cannot be addressed properly
export function sanitizeForCss(name: string): string {
  return (
    name
      // Replace any character that isn't a letter, digit, hyphen, or underscore
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      // Avoid a class name starting with a digit or a "-<digit>" sequence
      .replace(/^(-?\d)/, '_$1')
      .toLowerCase()
  );
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

'use strict';

export function debounce(fn, timeout) {
  let timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, timeout);
  };
}
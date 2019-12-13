'use strict';

export class Dict {
  constructor() {
    this.entries = [];
  }

  size() {
    return this.entries.length;
  }

  has(key) {
    return this.entries.some(entry => entry.key === key);
  }

  set(key, value) {
    if (!this.has(key))
      this.entries.push(
        new Entry(value, key)
      );
  }

  add(value, key) {
    this.set(key, value);
  }

  putEntry(entry) {
    if (!this.has(entry.key)) {
      this.entries.push(entry);
    }
  }

  keysArray() {
    return this.entries.map(entry => entry.key);
  }

  addEach(object) {
    Object.keys(object).forEach(key => {
      this.set(key, object[key]);
    });
  }

  clear() {
    this.entries = [];
  }

  get(key) {
    const found = this.entries.filter(entry => entry.key === key);
    return found[0]? found[0].value : null;
  }
}

class Entry {
  constructor(value, key) {
    this.value = value;
    this.key = key;
  }
}
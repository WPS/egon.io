export class Dictionary {
  private entries: Entry[];

  constructor() {
    this.entries = [];
  }

  get length(): number {
    return this.entries.length;
  }

  all(): Entry[] {
    return this.entries;
  }

  size(): number {
    return this.entries.length;
  }

  isEmpty(): boolean {
    return this.entries.length <= 0;
  }

  has(key: string): boolean {
    return this.entries.some((entry) => entry.key === key);
  }

  set(key: string, value: any): void {
    if (!this.has(key)) {
      this.entries.push(new Entry(value, key));
    }
  }

  add(value: any, key: string): void {
    this.set(key, value);
  }

  putEntry(entry: Entry): void {
    if (!this.has(entry.key)) {
      this.entries.push(entry);
    }
  }

  keysArray(): string[] {
    return this.entries.map((entry) => entry.key);
  }

  addEach(object: any): void {
    Object.keys(object).forEach((key) => {
      this.set(key, object[key]);
    });
  }

  addBuiltInIcons(builtInIcons: Dictionary): void {
    builtInIcons.entries.forEach((entry) => {
      if (!this.has(entry.key)) {
        this.entries.push(entry);
      }
    });
  }

  appendDict(dict: Dictionary): void {
    dict.entries.forEach((entry) => this.putEntry(entry));
  }

  clear(): void {
    this.entries = [];
  }

  delete(key: string): void {
    this.entries = this.entries.filter((entry) => entry.key !== key);
  }

  get(key: string): any {
    const found = this.entries.filter((entry) => entry.key === key);
    return found[0] ? found[0].value : null;
  }
}

export class Entry {
  value: any; // ToDo: dh, I think type of any is not a good choice. Try to figur out if we can use typed objects here.
  key: string;
  keyWords: string[];

  constructor(value: any, key: string, keyWords: string[] = []) {
    this.value = value;
    this.key = key;
    this.keyWords = keyWords;
  }
}

export class Dictionary<T> {
  private entries: Entry<T>[];

  constructor() {
    this.entries = [];
  }

  get length(): number {
    return this.entries.length;
  }

  all(): Entry<T>[] {
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

  putEntry(entry: Entry<T>): void {
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

  addBuiltInIcons(builtInIcons: Dictionary<T>): void {
    builtInIcons.entries.forEach((entry) => {
      if (!this.has(entry.key)) {
        this.entries.push(entry);
      }
    });
  }

  appendDict(dict: Dictionary<T>): void {
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

  /** Convert to a plain key-value object. */
  toRecord(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const entry of this.entries) {
      result[entry.key] = entry.value;
    }
    return result;
  }

  /** Create a Dictionary from a plain key-value object. */
  static fromRecord<T>(record: Record<string, T>): Dictionary<T> {
    const dict = new Dictionary<T>();
    for (const [key, value] of Object.entries(record)) {
      if (value != null) {
        dict.set(key, value);
      }
    }
    return dict;
  }
}

export class Entry<T> {
  value: T; // ToDo: dh, I think type of any is not a good choice. Try to figur out if we can use typed objects here.
  key: string;
  keyWords: string[];

  constructor(value: T, key: string, keyWords: string[] = []) {
    this.value = value;
    this.key = key;
    this.keyWords = keyWords;
  }
}

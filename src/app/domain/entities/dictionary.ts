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

  isEmpty(): boolean {
    return this.entries.length <= 0;
  }

  has(key: string): boolean {
    return this.keysArray().includes(key);
  }

  set(key: string, value: T): void {
    if (!this.has(key)) {
      this.entries.push(new Entry<T>(value, key));
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

  appendDict(dict: Dictionary<T>): void {
    dict.entries.forEach((entry) => this.putEntry(entry));
  }

  clear(): void {
    this.entries = [];
  }

  delete(key: string): void {
    this.entries = this.entries.filter((entry) => entry.key !== key);
  }

  get(key: string): T {
    const found = this.find(key);
    if (!found) {
      throw new Error(`Key ${key} not found in dictionary`);
    }
    return found;
  }

  find(key: string): T | undefined {
    return this.entries.find((entry) => entry.key === key)?.value;
  }

  /** Convert to a plain key-value object. */
  toRecord(): Record<string, T> {
    const result: Record<string, T> = {};
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
  value: T;
  key: string;
  keyWords: string[];

  constructor(value: T, key: string, keyWords: string[] = []) {
    this.value = value;
    this.key = key;
    this.keyWords = keyWords;
  }
}

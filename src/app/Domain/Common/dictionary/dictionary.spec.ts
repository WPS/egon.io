import { Dictionary, Entry } from './dictionary';

const key1 = 'key';
const key2 = 'another key';

const value1 = 'value';
const value2 = 'another value';

const testObject = {
  key: value1,
};

describe('Dict', () => {
  it('should create empty Dictionary', () => {
    // when
    const dict = new Dictionary();

    // then
    expect(dict).toBeTruthy();
    expect(dict.length).toEqual(0);
    expect(dict.size()).toEqual(0);
  });

  it('should add Entries', () => {
    // given
    const dict = new Dictionary();

    // when
    dict.add(value1, key1);
    dict.set(key2, value2);

    // then
    expect(dict.length === 2);
    expect(dict.get(key1)).toEqual(value1);
    expect(dict.get(key2)).toEqual(value2);
    expect(dict.has(key1)).toBeTruthy();
    expect(dict.has(key2)).toBeTruthy();
  });

  it('should put Entry', () => {
    // given
    const dict1 = new Dictionary();
    const entry = new Entry(value1, key1);

    // when
    dict1.putEntry(entry);

    // then
    expect(dict1.has(key1)).toBeTruthy();
    expect(dict1.get(key1)).toEqual(value1);
  });

  it('should add Each', () => {
    // given
    const dict1 = new Dictionary();

    // when
    dict1.addEach(testObject);

    // then
    expect(dict1.has(key1)).toBeTruthy();
  });

  it('should append Dict', () => {
    // given
    const dict1 = new Dictionary();
    const dict2 = new Dictionary();

    dict1.set(key1, value1);

    // when
    dict2.appendDict(dict1);

    // then
    expect(dict2.get(key1)).toEqual(dict1.get(key1));
  });

  it('should get keysArray', () => {
    // given
    const dict1 = new Dictionary();

    dict1.set(key1, value1);

    // when
    const keys = dict1.keysArray();

    // then
    expect(keys.length === 1);
    expect(keys[0]).toEqual(key1);
  });

  it('should delete entries', () => {
    // given
    const dict1 = new Dictionary();

    dict1.set(key1, value1);
    dict1.set(key2, value2);

    // when
    dict1.delete(key1);

    // then
    expect(dict1.length === 1);
    expect(dict1.get(key1)).toBeFalsy();
    expect(dict1.get(key2)).toBeTruthy();
  });

  it('should clear dict', () => {
    // given
    const dict1 = new Dictionary();

    dict1.set(key1, value1);

    // when
    dict1.clear();

    // then
    expect(dict1.length === 0).toBeTruthy();
  });
});

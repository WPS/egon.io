'use strict';

import { Dict, Entry } from '../../../app/domain-story-modeler/language/classes/collection';

const key1 = 'key';
const key2 = 'another key';

const value1 = 'value';
const value2 = 'another value';

const testObject = {
  key: value1
};

describe('Dict', function() {
  it('creates Dictionary', function() {

    // when
    const dict = new Dict();

    // then
    expect(dict == undefined).to.be.false;
    expect(dict.length === 0);
    expect(dict.size() === 0);
  });


  it('adds Entries', function() {

    // given
    const dict = new Dict();

    // when
    dict.add(value1, key1);
    dict.set(key2, value2);

    // then
    expect(dict.length === 2);
    expect(dict.get(key1)).equals(value1);
    expect(dict.get(key2)).equals(value2);
    expect(dict.has(key1));
    expect(dict.has(key2));
  });

  it('putEntry', function() {

    // given
    const dict1 = new Dict();
    const entry = new Entry(value1, key1);

    // when
    dict1.putEntry(entry);

    // then
    expect(dict1.has(key1));
    expect(dict1.get(key1)).equals(value1);
  });

  it('addEach', function() {

    // given
    const dict1 = new Dict();

    // when
    dict1.addEach(testObject);

    // then
    expect(dict1.has(key1));
  });

  it('appendDict', function() {

    // given
    const dict1 = new Dict();
    const dict2 = new Dict();

    dict1.set(key1, value1);

    // when
    dict2.appendDict(dict1);

    // then
    expect(dict2.get(key1)).equals(dict1.get(key1));
  });

  it('keysArray', function() {

    // given
    const dict1 = new Dict();

    dict1.set(key1, value1);

    // when
    const keys = dict1.keysArray();

    // then
    expect(keys.length === 1);
    expect(keys[0]).equals(key1);
  });

  it('deletes entries', function() {

    // given
    const dict1 = new Dict();

    dict1.set(key1, value1);
    dict1.set(key2, value2);

    // when
    dict1.delete(key1);

    // then
    expect(dict1.length === 1);
    expect(dict1.get(key2)).to.not.be.undefined;
  });

  it('clears dict', function() {

    // given
    const dict1 = new Dict();

    dict1.set(key1, value1);

    // when
    dict1.clear();

    // then
    expect(dict1.length === 0);
  });
});
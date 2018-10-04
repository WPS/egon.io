import sanitize from '../../../app/domain-story-modeler/domain-story/util/Sanitizer';

describe('Sanitizer', function() {
  it('sanitize test', function() {
    var res = sanitize('test');
    assert.equal(res, 'test');
    assert.deepEqual(res, 'test');
  });

  it('sanitize te&st', function() {
    var res = sanitize('te&st');
    assert.equal(res, 'test');
    assert.deepEqual(res, 'test');
  });

  it('sanitize <test>', function() {
    var res = sanitize('<test>');
    assert.equal(res, 'test');
    assert.deepEqual(res, 'test');
  });

  it('sanitize \'test\'', function() {
    var res = sanitize('\'test\'');
    assert.equal(res, 'test');
    assert.deepEqual(res, 'test');
  });

  it('sanitize <text id="test">&lttest&gt</test>', function() {
    var res = sanitize('<text id="test">&lttest&gt</test>');
    assert.equal(res, 'text id=testlttestgttest');
    assert.deepEqual(res, 'text id=testlttestgttest');
  });
});
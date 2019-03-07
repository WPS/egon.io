import sanitize from '../../../app/domain-story-modeler/util/Sanitizer';

describe('Sanitizer', function() {
  it('sanitize test', function() {
    var res = sanitize('test');
    assert.equal(res, 'test');
    assert.deepEqual(res, 'test');
  });

  it('sanitize te&st', function() {
    var res = sanitize('te&st');
    assert.equal(res, 'teundefinedst');
    assert.deepEqual(res, 'teundefinedst');
  });

  it('sanitize <test>', function() {
    var res = sanitize('<test>');
    assert.equal(res, 'test');
    assert.deepEqual(res, 'test');
  });

  it('sanitize <text id="test">&lttest&gt</test>', function() {
    var res = sanitize('<text id="test">&lttest&gt</test>');
    assert.equal(res, 'text id=testundefinedlttestundefinedgttest');
    assert.deepEqual(res, 'text id=testundefinedlttestundefinedgttest');
  });
});
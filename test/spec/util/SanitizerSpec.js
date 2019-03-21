import sanitizeFromDesktop from '../../../app/domain-story-modeler/util/Sanitizer';

describe('Sanitizer', function() {
  it('sanitize test', function() {
    var res = sanitizeFromDesktop('test');
    assert.equal(res, 'test');
    assert.deepEqual(res, 'test');
  });

  it('sanitize te&st', function() {
    var res = sanitizeFromDesktop('te/st');
    assert.equal(res, 'test');
    assert.deepEqual(res, 'test');
  });

  it('sanitize <test>', function() {
    var res = sanitizeFromDesktop('<test>');
    assert.equal(res, 'test');
    assert.deepEqual(res, 'test');
  });

  it('sanitize <text id="test">&lttest&gt</test>', function() {
    var res = sanitizeFromDesktop('<text id="test">&lttest&gt</test>');
    assert.equal(res, 'text id=test&test&gttest');
    assert.deepEqual(res, 'text id=test&test&gttest');
  });
});
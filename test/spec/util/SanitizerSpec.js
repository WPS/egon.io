import sanitizeFromDesktop from '../../../app/domain-story-modeler/util/Sanitizer';

describe('Sanitizer', function() {
  it('sanitize test', function() {
    let res = sanitizeFromDesktop('test');
    assert.equal(res, 'test');
    assert.deepEqual(res, 'test');
  });

  it('sanitize te&st', function() {
    let res = sanitizeFromDesktop('te/st');
    assert.equal(res, 'test');
    assert.deepEqual(res, 'test');
  });

  it('sanitize <test>', function() {
    let res = sanitizeFromDesktop('<test>');
    assert.equal(res, 'test');
    assert.deepEqual(res, 'test');
  });

  it('sanitize <text id="test">&test&</test>', function() {
    let res = sanitizeFromDesktop('<text id="test">&test&</test>');
    assert.equal(res, 'text id=test&test&test');
    assert.deepEqual(res, 'text id=test&test&test');
  });
});
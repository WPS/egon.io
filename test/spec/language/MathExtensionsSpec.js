import '../../../app/domain-story-modeler/util/MathExtensions';

describe ('MathExtensions', function() {

  it('Math.angleBetween test', function() {
    const startPoint = {
      x: 10,
      y: 10
    };

    const endPoint = {
      x: 20,
      y: 0
    };

    const res = Math.angleBetween(startPoint, endPoint);
    assert.equal(res, 45);
    assert.deepEqual(res, 45);
  });
});
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

  it('Math.degrees', function() {
    const rad = 0.5;
    const deg = 28.64788975654116;

    const converted = Math.degrees(rad);

    assert.equal(deg, converted);
    assert.deepEqual(deg, converted);
  });
});
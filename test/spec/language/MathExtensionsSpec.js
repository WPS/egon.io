import '../../../app/domain-story-modeler/util/MathExtensions';
import { activateTestMode } from '../../../app/domain-story-modeler/language/testmode';

activateTestMode();

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
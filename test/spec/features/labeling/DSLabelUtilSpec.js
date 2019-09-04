import '../../../../app/domain-story-modeler/util/MathExtensions';

import { selectPartOfActivity, calculateTextWidth } from '../../../../app/domain-story-modeler/features/labeling/DSLabelUtil';

describe('DSLabelUtil', function() {

  // will only be used for three or more waypoints
  it('selectActivity bothSlanted test', function() {
    const startPoint = {
      x: 10,
      y: 10
    };

    const endPoint = {
      x: 30,
      y: 30
    };

    const midPoint = {
      x: 30,
      y: 20
    };

    const waypoints = [startPoint, midPoint, endPoint];
    let angleActivity = [];

    for (let i = 0; i < 3 - 1; i++) { // calculate the angles of the activity
      angleActivity[i] = Math.angleBetween(waypoints[i], waypoints[i + 1]);
    }

    const res = selectPartOfActivity(waypoints, angleActivity);

    assert.equal(res, 0);
    assert.deepEqual(res, 0);

  });

  it('selectActivity secondStraight test', function() {
    const startPoint = {
      x: 10,
      y: 10
    };

    const endPoint = {
      x: 100,
      y: 30
    };

    const midPoint = {
      x: 20,
      y: 30
    };

    const waypoints = [startPoint, midPoint, endPoint];
    let angleActivity = [];

    for (let i = 0; i < 3 - 1; i++) { // calculate the angles of the activity
      angleActivity[i] = Math.angleBetween(waypoints[i], waypoints[i + 1]);
    }
    const res = selectPartOfActivity(waypoints, angleActivity);

    assert.equal(res, 1);
    assert.deepEqual(res, 1);

  });

  it('selectActivity firstStraight test', function() {
    const startPoint = {
      x: 10,
      y: 10
    };

    const endPoint = {
      x: 30,
      y: 30
    };

    const midPoint = {
      x: 30,
      y: 10
    };

    const waypoints = [startPoint, midPoint, endPoint];
    let angleActivity = [];

    for (let i = 0; i < 3 - 1; i++) { // calculate the angles of the activity
      angleActivity[i] = Math.angleBetween(waypoints[i], waypoints[i + 1]);
    }

    const res = selectPartOfActivity(waypoints, angleActivity);

    assert.equal(res, 0);
    assert.deepEqual(res, 0);
  });

});

describe('calculateTextWidth', function() {
  it('returns 0 for empty text', function() {
    assert.equal(0, calculateTextWidth(''));
  });

  it('returns 0 for null', function() {
    assert.equal(0, calculateTextWidth(null));
  });

  it('returns 0 for undefined', function() {
    assert.equal(0, calculateTextWidth(undefined));
  });

  it('returns same value for same characters', function() {
    assert.equal(calculateTextWidth('AIW'), calculateTextWidth('AIW'));
    assert.equal(calculateTextWidth('AIW'), calculateTextWidth('IWA'));
  });

  it('distinguishes casing', function() {
    assert.equal(calculateTextWidth('abcdefghi'), calculateTextWidth('ABCDEFGHI'));
  });
});

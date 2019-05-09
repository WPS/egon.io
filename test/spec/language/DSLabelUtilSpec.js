import '../../../app/domain-story-modeler/util/MathExtensions';

import { selectPartOfActivity, calculateTextWidth } from '../../../app/domain-story-modeler/features/labeling/DSLabelUtil';
import { activateTestMode } from '../../../app/domain-story-modeler/language/testmode';
import { labelPositionX, labelPositionY, labelPosition } from '../../../app/domain-story-modeler/features/labeling/position';

activateTestMode();

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

  it('labelPosition test', function() {
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
    const selectedActivity = selectPartOfActivity(waypoints, angleActivity);

    const xPos = labelPositionX(waypoints[selectedActivity], waypoints[selectedActivity + 1]);
    const yPos = labelPositionY(waypoints[selectedActivity], waypoints[selectedActivity + 1]);

    const supposed = {
      x: xPos,
      y: yPos,
      selected: selectedActivity
    };

    const res = labelPosition(waypoints);

    assert.equal(res.x, supposed.x);
    assert.deepEqual(res.x, supposed.x);
    assert.equal(res.y, supposed.y);
    assert.deepEqual(res.y, supposed.y);
    assert.equal(res.selected, supposed.selected);
    assert.deepEqual(res.selected, supposed.selected);
  });

  it('labelPosition test', function() {
    const startPoint = {
      x: 10,
      y: 10
    };

    const endPoint = {
      x: 30,
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
    const selectedActivity = selectPartOfActivity(waypoints, angleActivity);

    const xPos = labelPositionX(waypoints[selectedActivity], waypoints[selectedActivity + 1]);
    const yPos = labelPositionY(waypoints[selectedActivity], waypoints[selectedActivity + 1]);

    const supposed = {
      x: xPos,
      y: yPos,
      selected: selectedActivity
    };

    const res = labelPosition(waypoints);

    assert.equal(res.x, supposed.x);
    assert.deepEqual(res.x, supposed.x);
    assert.equal(res.y, supposed.y);
    assert.deepEqual(res.y, supposed.y);
    assert.equal(res.selected, supposed.selected);
    assert.deepEqual(res.selected, supposed.selected);
  });

  it('labelPosition test', function() {
    const startPoint = {
      x: 10,
      y: 10
    };

    const endPoint = {
      x: 30,
      y: 30
    };

    const midPoint = {
      x: 15,
      y: 15
    };

    const waypoints = [startPoint, midPoint, endPoint];

    let angleActivity = [];
    for (let i = 0; i < 3 - 1; i++) { // calculate the angles of the activity
      angleActivity[i] = Math.angleBetween(waypoints[i], waypoints[i + 1]);
    }
    const selectedActivity = selectPartOfActivity(waypoints, angleActivity);

    const xPos = labelPositionX(waypoints[selectedActivity], waypoints[selectedActivity + 1]);
    const yPos = labelPositionY(waypoints[selectedActivity], waypoints[selectedActivity + 1]);

    const supposed = {
      x: xPos,
      y: yPos,
      selected: selectedActivity
    };

    const res = labelPosition(waypoints);

    assert.equal(res.x, supposed.x);
    assert.deepEqual(res.x, supposed.x);
    assert.equal(res.y, supposed.y);
    assert.deepEqual(res.y, supposed.y);
    assert.equal(res.selected, supposed.selected);
    assert.deepEqual(res.selected, supposed.selected);
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

});

import {
  calculateDeg,
  calculateXY,
  selectActivity,
  labelPosition,
  labelPositionX,
  labelPositionY
} from '../../app/domain-story-modeler/domain-story/label-editing/DSLabelUtil';

describe('DSLabelUtil', function() {

  it('calculateDeg test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 20,
      y: 0
    };

    var res = calculateDeg(startPoint, endPoint);
    assert.equal(res, 45);
    assert.deepEqual(res, 45);
  });

  it('calculateXY x-coordinate test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 20,
      y: 20
    };

    var res = calculateXY(startPoint.x, endPoint.x);

    assert.equal(res, 15);
    assert.deepEqual(res, 15);
  });

  it('calculateXY y-coordinate test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 20,
      y: 20
    };

    var res = calculateXY(startPoint.y, endPoint.y);

    assert.equal(res, 15);
    assert.deepEqual(res, 15);
  });

  it('labelPositionX 0degrees test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 20,
      y: 10
    };

    var res = labelPositionX(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.x, endPoint.x));
  });

  it('labelPositionX 180degrees test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 0,
      y: 10
    };

    var res = labelPositionX(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.x, endPoint.x));
  });

  it('labelPositionX  270degrees test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 10,
      y: 20
    };

    var res = labelPositionX(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.x, endPoint.x));
  });

  it('labelPositionX 90degrees test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 10,
      y: 0
    };

    var res = labelPositionX(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.x, endPoint.x));
  });

  it('labelPositionX upperRight test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 15,
      y: 5
    };
    var angle = calculateDeg(startPoint, endPoint);

    var res = labelPositionX(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.x, endPoint.x) + 5 - (angle) / 6);
  });

  it('labelPositionX lowerRight test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 15,
      y: 15
    };
    var angle = calculateDeg(startPoint, endPoint);

    var res = labelPositionX(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.x, endPoint.x) + 5 - (angle - 270) / 6);
  });

  it('labelPositionX lower left test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 5,
      y: 15
    };
    var angle = calculateDeg(startPoint, endPoint);

    var res = labelPositionX(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.x, endPoint.x) + (angle - 180) / 18);
  });

  it('labelPositionX upperLeft test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 5,
      y: 5
    };
    var angle = calculateDeg(startPoint, endPoint);

    var res = labelPositionX(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.x, endPoint.x) + 5 - (angle - 90) / 18);
  });

  it('labelPositionY 0degrees test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 20,
      y: 10
    };

    var res = labelPositionY(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.y, endPoint.y) + 15);
  });

  it('labelPositionY 180degrees test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 0,
      y: 10
    };

    var res = labelPositionY(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.y, endPoint.y) + 15);
  });

  it('labelPositionY 270degrees test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 10,
      y: 20
    };

    var res = labelPositionY(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.y, endPoint.y));
  });

  it('labelPositionY 90degrees test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 10,
      y: 0
    };

    var res = labelPositionY(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.y, endPoint.y));
  });

  it('labelPositionY upperRight test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 15,
      y: 5
    };
    var angle = calculateDeg(startPoint, endPoint);

    var res = labelPositionY(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.y, endPoint.y) + 15 - (angle) / 6);
  });

  it('labelPositionY lowerRight test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 15,
      y: 15
    };
    var angle = calculateDeg(startPoint, endPoint);

    var res = labelPositionY(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.y, endPoint.y) - (angle - 270) / 9);
  });

  it('labelPositionY lowerLeft test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 5,
      y: 15
    };
    var angle = calculateDeg(startPoint, endPoint);

    var res = labelPositionY(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.y, endPoint.y) + 15 - (angle - 180) / 3);
  });

  it('labelPositionY upperLeft test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 5,
      y: 5
    };
    var angle = calculateDeg(startPoint, endPoint);

    var res = labelPositionY(startPoint, endPoint);
    assert.equal(res, calculateXY(startPoint.y, endPoint.y) - (angle - 90) / 9);
  });

  // will only be used for three or more waypoints
  it('selectActivity bothSlanted test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 30,
      y: 30
    };

    var midPoint = {
      x: 30,
      y: 20
    };

    var waypoints = [startPoint, midPoint, endPoint];
    var angleActivity = [];

    for (var i = 0; i < 3 - 1; i++) { // calculate the angles of the activity
      angleActivity[i] = calculateDeg(waypoints[i], waypoints[i + 1]);
    }

    var res = selectActivity(waypoints, angleActivity);

    assert.equal(res, 0);
    assert.deepEqual(res, 0);

  });

  it('selectActivity secondStraight test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 100,
      y: 30
    };

    var midPoint = {
      x: 20,
      y: 30
    };

    var waypoints = [startPoint, midPoint, endPoint];
    var angleActivity = new Array(2);

    for (var i = 0; i < 3 - 1; i++) { // calculate the angles of the activity
      angleActivity[i] = calculateDeg(waypoints[i], waypoints[i + 1]);
    }
    var res = selectActivity(waypoints, angleActivity);

    assert.equal(res, 1);
    assert.deepEqual(res, 1);

  });

  it('selectActivity firstStraight test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 30,
      y: 30
    };

    var midPoint = {
      x: 30,
      y: 10
    };

    var waypoints = [startPoint, midPoint, endPoint];
    var angleActivity = new Array(2);

    for (var i = 0; i < 3 - 1; i++) { // calculate the angles of the activity
      angleActivity[i] = calculateDeg(waypoints[i], waypoints[i + 1]);
    }

    var res = selectActivity(waypoints, angleActivity);

    assert.equal(res, 0);
    assert.deepEqual(res, 0);
  });

  it('labelPosition test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 30,
      y: 30
    };

    var midPoint = {
      x: 30,
      y: 20
    };

    var waypoints = [startPoint, midPoint, endPoint];

    var angleActivity = new Array(2);
    for (var i = 0; i < 3 - 1; i++) { // calculate the angles of the activity
      angleActivity[i] = calculateDeg(waypoints[i], waypoints[i + 1]);
    }
    var selectedActivity = selectActivity(waypoints, angleActivity);

    var xPos = labelPositionX(waypoints[selectedActivity], waypoints[selectedActivity + 1]);
    var yPos = labelPositionY(waypoints[selectedActivity], waypoints[selectedActivity + 1]);

    var supposed = {
      x: xPos,
      y: yPos,
      selected: selectedActivity
    };

    var res = labelPosition(waypoints);

    assert.equal(res.x, supposed.x);
    assert.deepEqual(res.x, supposed.x);
    assert.equal(res.y, supposed.y);
    assert.deepEqual(res.y, supposed.y);
    assert.equal(res.selected, supposed.selected);
    assert.deepEqual(res.selected, supposed.selected);
  });

  it('labelPosition test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 30,
      y: 30
    };

    var midPoint = {
      x: 20,
      y: 30
    };

    var waypoints = [startPoint, midPoint, endPoint];

    var angleActivity = new Array(2);
    for (var i = 0; i < 3 - 1; i++) { // calculate the angles of the activity
      angleActivity[i] = calculateDeg(waypoints[i], waypoints[i + 1]);
    }
    var selectedActivity = selectActivity(waypoints, angleActivity);

    var xPos = labelPositionX(waypoints[selectedActivity], waypoints[selectedActivity + 1]);
    var yPos = labelPositionY(waypoints[selectedActivity], waypoints[selectedActivity + 1]);

    var supposed = {
      x: xPos,
      y: yPos,
      selected: selectedActivity
    };

    var res = labelPosition(waypoints);

    assert.equal(res.x, supposed.x);
    assert.deepEqual(res.x, supposed.x);
    assert.equal(res.y, supposed.y);
    assert.deepEqual(res.y, supposed.y);
    assert.equal(res.selected, supposed.selected);
    assert.deepEqual(res.selected, supposed.selected);
  });

  it('labelPosition test', function() {
    var startPoint = {
      x: 10,
      y: 10
    };

    var endPoint = {
      x: 30,
      y: 30
    };

    var midPoint = {
      x: 15,
      y: 15
    };

    var waypoints = [startPoint, midPoint, endPoint];

    var angleActivity = new Array(2);
    for (var i = 0; i < 3 - 1; i++) { // calculate the angles of the activity
      angleActivity[i] = calculateDeg(waypoints[i], waypoints[i + 1]);
    }
    var selectedActivity = selectActivity(waypoints, angleActivity);

    var xPos = labelPositionX(waypoints[selectedActivity], waypoints[selectedActivity + 1]);
    var yPos = labelPositionY(waypoints[selectedActivity], waypoints[selectedActivity + 1]);

    var supposed = {
      x: xPos,
      y: yPos,
      selected: selectedActivity
    };

    var res = labelPosition(waypoints);

    assert.equal(res.x, supposed.x);
    assert.deepEqual(res.x, supposed.x);
    assert.equal(res.y, supposed.y);
    assert.deepEqual(res.y, supposed.y);
    assert.equal(res.selected, supposed.selected);
    assert.deepEqual(res.selected, supposed.selected);
  });
});
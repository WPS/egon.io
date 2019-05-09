import { selectPartOfActivity } from '../../../../app/domain-story-modeler/features/labeling/DSLabelUtil';
import { labelPositionX, labelPositionY, labelPosition } from '../../../../app/domain-story-modeler/features/labeling/position';

describe('position', function() {

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
});
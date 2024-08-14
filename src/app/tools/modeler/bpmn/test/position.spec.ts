import { selectPartOfActivity } from '../modeler/labeling/dsLabelUtil';
import {
  labelPosition,
  labelPositionX,
  labelPositionY,
} from '../modeler/labeling/position';
import { angleBetween } from '../../../../utils/mathExtensions';

describe('position', function () {
  it('labelPosition test', function () {
    const startPoint = {
      x: 10,
      y: 10,
    };

    const endPoint = {
      x: 30,
      y: 30,
    };

    const midPoint = {
      x: 30,
      y: 20,
    };
    const waypoints = [startPoint, midPoint, endPoint];

    let angleActivity = [];
    for (let i = 0; i < 3 - 1; i++) {
      // calculate the angles of the activity
      angleActivity[i] = angleBetween(waypoints[i], waypoints[i + 1]);
    }
    const segment = selectPartOfActivity(waypoints, angleActivity);

    const xPos = labelPositionX(waypoints[segment], waypoints[segment + 1]);
    const yPos = labelPositionY(waypoints[segment], waypoints[segment + 1]);

    const supposed = {
      x: xPos,
      y: yPos,
      selected: segment,
    };

    const res = labelPosition(waypoints);

    expect(res).toEqual(supposed);
  });

  it('labelPosition test1', function () {
    const startPoint = {
      x: 10,
      y: 10,
    };

    const endPoint = {
      x: 30,
      y: 30,
    };

    const midPoint = {
      x: 20,
      y: 30,
    };

    const waypoints = [startPoint, midPoint, endPoint];

    let angleActivity = [];
    for (let i = 0; i < 3 - 1; i++) {
      // calculate the angles of the activity
      angleActivity[i] = angleBetween(waypoints[i], waypoints[i + 1]);
    }
    const segment = selectPartOfActivity(waypoints, angleActivity);

    const xPos = labelPositionX(waypoints[segment], waypoints[segment + 1]);
    const yPos = labelPositionY(waypoints[segment], waypoints[segment + 1]);

    const supposed = {
      x: xPos,
      y: yPos,
      selected: segment,
    };

    const res = labelPosition(waypoints);

    expect(res).toEqual(supposed);
  });

  it('labelPosition test2', function () {
    const startPoint = {
      x: 10,
      y: 10,
    };

    const endPoint = {
      x: 30,
      y: 30,
    };

    const midPoint = {
      x: 15,
      y: 15,
    };

    const waypoints = [startPoint, midPoint, endPoint];

    let angleActivity = [];
    for (let i = 0; i < 3 - 1; i++) {
      // calculate the angles of the activity
      angleActivity[i] = angleBetween(waypoints[i], waypoints[i + 1]);
    }
    const segment = selectPartOfActivity(waypoints, angleActivity);

    const xPos = labelPositionX(waypoints[segment], waypoints[segment + 1]);
    const yPos = labelPositionY(waypoints[segment], waypoints[segment + 1]);

    const supposed = {
      x: xPos,
      y: yPos,
      selected: segment,
    };

    const res = labelPosition(waypoints);

    expect(res).toEqual(supposed);
  });

  it('labelPosition two waypoints', function () {
    const startPoint = {
      x: 10,
      y: 10,
    };

    const endPoint = {
      x: 20,
      y: 20,
    };

    const waypoints = [startPoint, endPoint];
    const segment = 0;

    const xPos = labelPositionX(waypoints[segment], waypoints[segment + 1]);
    const yPos = labelPositionY(waypoints[segment], waypoints[segment + 1]);

    const supposed = {
      x: xPos,
      y: yPos,
      selected: segment,
    };

    const res = labelPosition(waypoints);

    expect(res).toEqual(supposed);
  });
});

import '../../../../utils/mathExtensions';
import {
  approximateArialSize11TextWidthInPixel,
  selectPartOfActivity,
} from '../features/labeling/dsLabelUtil';
import { angleBetween } from '../../../../utils/mathExtensions';

describe('DSLabelUtil', function () {
  // will only be used for three or more waypoints
  it('selectActivity bothSlanted test', function () {
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

    const res = selectPartOfActivity(waypoints, angleActivity);

    expect(res).toEqual(0);
  });

  it('selectActivity secondStraight test', function () {
    const startPoint = {
      x: 10,
      y: 10,
    };

    const endPoint = {
      x: 100,
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
    const res = selectPartOfActivity(waypoints, angleActivity);

    expect(res).toEqual(1);
  });

  it('selectActivity firstStraight test', function () {
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
      y: 10,
    };

    const waypoints = [startPoint, midPoint, endPoint];
    let angleActivity = [];

    for (let i = 0; i < 3 - 1; i++) {
      // calculate the angles of the activity
      angleActivity[i] = angleBetween(waypoints[i], waypoints[i + 1]);
    }

    const res = selectPartOfActivity(waypoints, angleActivity);

    expect(res).toEqual(0);
  });
});

describe('calculateTextWidth', function () {
  it('returns 0 for empty text', function () {
    expect(approximateArialSize11TextWidthInPixel('')).toEqual(0);
  });

  it('returns 0 for null', function () {
    expect(approximateArialSize11TextWidthInPixel(null)).toEqual(0);
  });

  it('returns 0 for undefined', function () {
    expect(approximateArialSize11TextWidthInPixel(undefined)).toEqual(0);
  });

  it('returns same value for same characters', function () {
    expect(approximateArialSize11TextWidthInPixel('AIW')).toEqual(
      approximateArialSize11TextWidthInPixel('AIW'),
    );
    expect(approximateArialSize11TextWidthInPixel('AIW')).toEqual(
      approximateArialSize11TextWidthInPixel('IWA'),
    );
  });

  it('distinguishes casing', function () {
    expect(approximateArialSize11TextWidthInPixel('abcdefghi')).toEqual(
      approximateArialSize11TextWidthInPixel('ABCDEFGHI'),
    );
  });
});

import { angleBetween, degrees, positionsMatch } from './mathExtensions';

describe('angleBetween', function () {
  it('quadrant 0, angle 0', function () {
    expect(angleBetween({ x: 0, y: 0 }, { x: 10, y: 0 })).toEqual(0);
  });
  it('quadrant 0, angle 45', function () {
    expect(angleBetween({ x: 10, y: -10 }, { x: 20, y: -20 })).toEqual(45);
  });
  it('quadrant 0, angle 90', function () {
    expect(angleBetween({ x: 10, y: -10 }, { x: 10, y: -20 })).toEqual(90);
  });
  it('quadrant 1, angle 135', function () {
    expect(angleBetween({ x: -10, y: -10 }, { x: -20, y: -20 })).toEqual(135);
  });
  it('quadrant 1, angle 180', function () {
    expect(angleBetween({ x: 10, y: -10 }, { x: 0, y: -10 })).toEqual(180);
  });
  it('quadrant 2, angle 225', function () {
    expect(angleBetween({ x: -10, y: 10 }, { x: -20, y: 20 })).toEqual(225);
  });
  it('quadrant 3, angle 270', function () {
    expect(angleBetween({ x: 10, y: -10 }, { x: 10, y: 0 })).toEqual(270);
  });
  it('quadrant 3, angle 315', function () {
    expect(angleBetween({ x: 10, y: 10 }, { x: 20, y: 20 })).toEqual(315);
  });
  it('quadrant 3, angle 359,99', function () {
    expect(
      angleBetween({ x: 0, y: 0 }, { x: 1000, y: 0.1 })?.toFixed(2),
    ).toEqual('359.99');
  });
});

describe('degrees', function () {
  it('0 -> 0', function () {
    expect(degrees(0)).toEqual(0);
  });
  it('Pi/4 -> 45', function () {
    expect(degrees(Math.PI / 4)).toEqual(45);
  });
  it('Pi/3 -> 60', function () {
    expect(degrees(Math.PI / 3).toPrecision(2)).toEqual('60');
  });
  it('Pi/2 -> 90', function () {
    expect(degrees(Math.PI / 2)).toEqual(90);
  });
  it('Pi -> 180', function () {
    expect(degrees(Math.PI)).toEqual(180);
  });
  it('3/2 Pi -> 270', function () {
    expect(degrees((Math.PI * 3) / 2)).toEqual(270);
  });
  it('2 Pi -> 360', function () {
    expect(degrees(Math.PI * 2)).toEqual(360);
  });
  it('-Pi/2 -> -90', function () {
    expect(degrees(-Math.PI / 2)).toEqual(-90);
  });
});

describe('positionsMatch', function () {
  it('match', function () {
    expect(positionsMatch(10, 10, 10, 10, 10.01, 19.99)).toBeTrue();
  });
  it('clickX < elementX', function () {
    expect(positionsMatch(10, 10, 10, 10, 10, 15)).toBeFalse();
  });
  it('clickY < elementY', function () {
    expect(positionsMatch(10, 10, 10, 10, 15, 10)).toBeFalse();
  });
  it('out of width', function () {
    expect(positionsMatch(10, 10, 10, 10, 20, 15)).toBeFalse();
  });
  it('out of height', function () {
    expect(positionsMatch(10, 10, 10, 10, 15, 20)).toBeFalse();
  });
});

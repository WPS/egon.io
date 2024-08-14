import { numberBoxDefinitions } from '../modeler/numbering/numbering';

describe('numbering', function () {
  it('numberBoxDefinitions angle 270', function () {
    // Given
    const activityArrow = {
      waypoints: [
        {
          original: {
            x: 10,
            y: 10,
          },
          x: 10,
          y: 10,
        },
        {
          original: {
            x: 10,
            y: 20,
          },
          x: 10,
          y: 20,
        },
      ],
    };

    // When
    const box = numberBoxDefinitions(activityArrow);

    // Then
    expect(box.x).toEqual(15);
    expect(box.y).toEqual(50);
  });

  it('numberBoxDefinitions angle 315', function () {
    // Given
    const activityArrow = {
      waypoints: [
        {
          original: {
            x: 10,
            y: 10,
          },
          x: 10,
          y: 10,
        },
        {
          original: {
            x: 20,
            y: 20,
          },
          x: 20,
          y: 20,
        },
      ],
    };

    // When
    const box = numberBoxDefinitions(activityArrow);

    // Then
    expect(box.x).toEqual(40);
    expect(box.y).toEqual(50);
  });
});

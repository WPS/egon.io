import { labelPosition } from "../../modeler/labeling/position";
import { numberBoxDefinitions } from "../../modeler/numbering/numbering";

describe("numbering", function () {
  it("numberBoxDefinitions", function () {
    // Given
    const element = {
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

    const position = labelPosition(element.waypoints);

    // When

    const box = numberBoxDefinitions(element);

    // Then

    expect(box.x).toEqual(position.x - 50);
    expect(box.y).toEqual(position.y - 19);
  });
});

import { numberBoxDefinitions } from '../../../../app/domain-story-modeler/features/numbering/numbering';
import { labelPosition } from '../../../../app/domain-story-modeler/features/labeling/position';

describe('numbering', function() {

  it('numberBoxDefinitions', function() {

    // Given
    const element = {
      waypoints: [{
        original: {
          x: 10,
          y:10
        },
        x:10,
        y:10
      },
      {
        original: {
          x: 20,
          y:20
        },
        x:20,
        y:20
      }
      ]
    };

    const position = labelPosition(element.waypoints);

    // When

    const box = numberBoxDefinitions(element);

    // Then

    assert.equal(box.x, position.x - 50);
    assert.equal(box.y, position.y - 19);
  });

});
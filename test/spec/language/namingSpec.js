import { getNameFromType } from '../../../app/domain-story-modeler/language/naming';
import { ACTOR, WORKOBJECT } from '../../../app/domain-story-modeler/language/elementTypes';

describe('naming.js', function() {
  it('StandardType ACTOR', function() {

    // When
    const name = getNameFromType(ACTOR + 'test');

    // Then
    assert.equal(name, 'test');
  });

  it('StandardType WORKOBJECT', function() {

    // When
    const name = getNameFromType(WORKOBJECT + 'test');

    // Then
    assert.equal(name, 'test');
  });

  it('NotStandardType', function() {

    // When
    const name = getNameFromType('');

    // Then
    expect(name).to.be.undefined;
  });
});
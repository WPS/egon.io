import { ACTOR, GROUP } from '../../../app/domain-story-modeler/language/elementTypes';
import { isDomainStoryGroup, isInDomainStoryGroup, isDomainStoryElement, isDomainStory } from '../../../app/domain-story-modeler/util/TypeCheck';

const testElementDomainStoryActor = {
  type: ACTOR,
  businessObject: {
    type: ACTOR
  }
};

const testElementNotDomainStory = {
  type: '',
  businessObject: {
    type: ''
  }
};

const testElementDomainStoryGroup = {
  type: GROUP
};

const testElementDomainStoryIsInGroup = {
  parent : {
    type: GROUP
  }
};

const testElementDomainStoryIsNotInGroup = {
  parent: {
    type: ''
  }
};

describe('Util TypeCheck', function() {
  it('test isDomainStory true', function() {

    // Given
    let testObject = testElementDomainStoryActor;

    // When
    const check = isDomainStory(testObject);

    // Then
    expect(check).to.be.true;
  });

  it('test isDomainStory false', function() {

    // Given
    let testObject = testElementNotDomainStory;

    // When
    const check = isDomainStory(testObject);

    // Then
    expect(check).to.be.false;
  });

  it('test isDomainStoryGroup true', function() {

    // Given
    let testObject = testElementDomainStoryGroup;

    // When
    const check = isDomainStoryGroup(testObject);

    // Then
    expect(check).to.be.true;
  });

  it('test isDomainStoryGroup false', function() {

    // Given
    let testObject = testElementDomainStoryActor;

    // When
    const check = isDomainStoryGroup(testObject);

    // Then
    expect(check).to.be.false;
  });

  it('test isInDomainStoryGroup true', function() {

    // Given
    let testObject = testElementDomainStoryIsInGroup;

    // When
    const check = isInDomainStoryGroup(testObject);

    // Then
    expect(check).to.be.true;
  });

  it('test isInDomainStoryGroup false', function() {

    // Given
    let testObject = testElementDomainStoryIsNotInGroup;

    // When
    const check = isInDomainStoryGroup(testObject);

    // Then
    expect(check).to.be.false;
  });

  it('test isInDomainStoryGroup false No parent', function() {

    // Given
    let testObject = testElementDomainStoryActor;

    // When
    const check = isInDomainStoryGroup(testObject);

    // Then
    expect(check).to.be.false;
  });

  it('test isDomainStoryElement true', function() {

    // Given
    let testObject = testElementDomainStoryActor;

    // When
    const check = isDomainStoryElement(testObject);

    // Then
    expect(check).to.be.true;
  });

  it('test isDomainStoryElement false', function() {

    // Given
    let testObject = testElementNotDomainStory;

    // When
    const check = isDomainStoryElement(testObject);

    // Then
    expect(check).to.be.false;
  });
});
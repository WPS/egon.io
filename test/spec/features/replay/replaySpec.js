import {
  isStoryConsecutivelyNumbered,
} from '../../../../app/domain-story-modeler/features/replay/replay';
import {
  ACTOR,
  WORKOBJECT,
  ACTIVITY
} from '../../../../app/domain-story-modeler/language/elementTypes';
import { createStep, traceActivities } from '../../../../app/domain-story-modeler/features/replay/initializeReplay';

describe('replay', function() {
  it('isStoryConsecutivelyNumbered true', function() {

    // Given
    const replaySteps = [
      { activities: [1] },
      { activities: [1] },
      { activities: [1] },
      { activities: [1] },
      { activities: [1] },
      { activities: [1] },
      { activities: [1] }
    ];

    // When
    const isConsecutive = isStoryConsecutivelyNumbered(replaySteps);

    // Then
    expect(isConsecutive).to.be.true;
  });

  it('isStoryConsecutivelyNumbered false', function() {

    // Given
    const replaySteps = [
      { activities: [' '] },
      { activities: [' '] },
      { activities: [] },
      { activities: [' '] },
      { activities: [' '] },
      { activities: [' '] },
      { activities: [' '] }
    ];

    // When
    const isConsecutive = isStoryConsecutivelyNumbered(replaySteps);

    // Then
    expect(isConsecutive).to.be.false;
  });

  it('createStep', function() {

    // fix test
    // Given
    const activityTrace = [
      {
        type: ACTIVITY,
        businessObject: {},
        source: 'initial',
        target: {
          businessObject: {
            type: WORKOBJECT
          },
          outgoing: [
            {
              type: ACTIVITY,
              target: {
                businessObject: {
                  type: ACTOR
                }
              }
            }
          ]
        }
      }
    ];

    // When

    const step = createStep(activityTrace);

    // Then

    expect(step.sources).to.exist;
    assert.equal(step.sources[0], activityTrace[0].source);
    expect(step.activities).to.exist;
    assert.equal(step.activities.length, 2);
    expect(step.targets).to.exist;
    assert.equal(step.targets.length, 2);
  });

  it('traceActivities', function() {

    // Given

    const tracedActivity1 = {
            type: ACTIVITY,
            businessObject: {
              number: 1
            },
            source: 'initial',
            number: 1,
            target: {
              businessObject: {
                type: WORKOBJECT
              },
              outgoing: [
                {
                  type: ACTIVITY,
                  target: {
                    businessObject: {
                      type: ACTOR
                    }
                  }
                }
              ]
            }
          },
          tracedActivity2 = {
            type: ACTIVITY,
            businessObject: {
              number: 2
            },
            source: 'initial',
            number: 2,
            target: {
              businessObject: {
                type: WORKOBJECT
              },
              outgoing: [
                {
                  type: ACTIVITY,
                  target: {
                    businessObject: {
                      type: ACTOR
                    }
                  }
                }
              ]
            }
          };
    let activitiesFromActors = [tracedActivity1, tracedActivity2];

    // When

    const tracedActivities = traceActivities(activitiesFromActors);

    // Then
    expect(tracedActivities).to.exist;
    assert.equal(tracedActivities.length, 2);
  });
});

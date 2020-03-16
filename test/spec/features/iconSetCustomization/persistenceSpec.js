import { addToSelectedActors, getSelectedActorsDictionary, getSelectedWorkObjectsDictionary, addToSelectedWorkObjects } from '../../../../app/domain-story-modeler/features/iconSetCustomization/dictionaries';
import { getTypeIconSRC, initTypeDictionaries } from '../../../../app/domain-story-modeler/language/icon/dictionaries';
import { ACTOR, WORKOBJECT } from '../../../../app/domain-story-modeler/language/elementTypes';
import { createConfigFromDictionaries } from '../../../../app/domain-story-modeler/features/iconSetCustomization/persitence';
import { default_conf } from '../../../../app/domain-story-modeler/language/icon/iconConfig';

describe('persitence ', function() {
  const actorName = 'Pet', workObjectName = 'Flag';

  it('createConfigFromDictionaries', function() {

    // Given
    initTypeDictionaries(default_conf.actors, default_conf.workObjects);
    addToSelectedActors(actorName, getTypeIconSRC(ACTOR, ACTOR + actorName));
    addToSelectedWorkObjects(workObjectName, getTypeIconSRC(WORKOBJECT, WORKOBJECT + workObjectName));

    const actors = getSelectedActorsDictionary();
    const workObjects = getSelectedWorkObjectsDictionary();

    // When
    const json = createConfigFromDictionaries(actors, null, workObjects, null);

    // Then
    const actorsJSON = json.actors;
    const workObjectsJSON = json.workObjects;

    expect(actorsJSON).to.exist;
    expect(actorsJSON.Pet).to.exist;
    expect(workObjectsJSON).to.exist;
    expect(workObjectsJSON.Flag).to.exist;
  });
});
import { addToSelectedActors, addToSelectedWorkObjects, getSelectedActorsDictionary, getSelectedWorkObjectsDictionary } from '../../../../app/domain-story-modeler/features/iconSetCustomization/dictionaries';
import { initTypeDictionaries, getTypeIconSRC } from '../../../../app/domain-story-modeler/language/icon/dictionaries';
import { default_conf } from '../../../../app/domain-story-modeler/language/icon/iconConfig';
import { ACTOR, WORKOBJECT } from '../../../../app/domain-story-modeler/language/elementTypes';
import { createConfigFromDictionaries } from '../../../../app/domain-story-modeler/features/iconSetCustomization/persitence';

initTypeDictionaries(default_conf.actors, default_conf.workObjects);

describe('', function() {
  let actorName = 'Pet',
      workObjectName = 'Flag';

  it('createConfigFromDictionaries', function() {
    // Given
    addToSelectedActors(actorName, getTypeIconSRC(ACTOR, actorName));
    addToSelectedWorkObjects(workObjectName, getTypeIconSRC(WORKOBJECT, workObjectName));

    const actors = getSelectedActorsDictionary();
    const workObjects = getSelectedWorkObjectsDictionary();

    // When
    const json = createConfigFromDictionaries(actors, workObjects);

    // Then
    const actorsJSON = json.actors;
    const workObjectsJSON = json.workObjects;

    console.log(actorsJSON);

    expect(actorsJSON).to.exist;
    expect(actorsJSON.Person).to.exist;
    expect(workObjectsJSON).to.exist;
    expect(workObjectsJSON.Folder).to.exist;
  });

});
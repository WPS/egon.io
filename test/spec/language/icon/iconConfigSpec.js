import { appendSRCFile } from '../../../../app/domain-story-modeler/language/icon/iconConfig';
import { appendedIcons } from '../../../../app/domain-story-modeler/language/icon/all_Icons';
import { Dict } from '../../../../app/domain-story-modeler/language/classes/collection';

describe('iconConfig', function() {
  it('appendSRCFile', function() {

    // Given

    let actors = { 'Pet': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><circle cx="4.5" cy="9.5" r="2.5"/><circle cx="9" cy="5.5" r="2.5"/><circle cx="15" cy="5.5" r="2.5"/><circle cx="19.5" cy="9.5" r="2.5"/><path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.03 2.33 2.32.73.15 3.06-.44 5.54-.44h.18c2.48 0 4.81.58 5.54.44 1.31-.29 2.04-1.31 2.33-2.32.31-2.04-1.3-3.49-2.61-4.8z"/></svg>' },
        workObjects = { 'Flag': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>' };

    let actorDict = new Dict();
    let workObjectDict = new Dict();

    actorDict.addEach(actors);
    workObjectDict.addEach(workObjects);

    actors = actorDict.keysArray();
    workObjects = workObjectDict.keysArray();

    // When
    appendSRCFile(actors, actorDict, workObjects, workObjectDict);

    // Then
    expect(appendedIcons.has('Pet'));
    expect(appendedIcons.has('Flag'));
  });
});
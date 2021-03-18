import { restoreTitleFromFileName } from '../../../../app/domain-story-modeler/features/import/import';

describe('restore title', function() {

  it('from .dst file', function() {

    // Given
    let filename = 'Exported Domain Story (name with blanks)_2021-01-13.dst';

    // When
    let title = restoreTitleFromFileName(filename, false);


    // Then
    assert.equal(title, 'Exported Domain Story (name with blanks)');

  });

  it('from .dst.svg', function() {

    // Given
    let filename = 'Exported Domain Story (name with blanks)_2021-01-13.dst.svg';

    // When
    let title = restoreTitleFromFileName(filename, true);


    // Then
    assert.equal(title, 'Exported Domain Story (name with blanks)');

  });

});
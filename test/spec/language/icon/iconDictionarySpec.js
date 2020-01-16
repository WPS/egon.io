import { registerIcon, getIconForType, getIconDictionaryKeys } from '../../../../app/domain-story-modeler/language/icon/iconDictionary';

describe('iconDictionary', function() {

  it('can register Icon', function() {

    // Given
    const iconName = 'testName';
    const src = 'testSource';

    // When
    registerIcon(iconName, src);

    // Then
    const fromDict = getIconForType(iconName);
    const keys = getIconDictionaryKeys();

    expect(keys).to.contain(iconName);
    expect(fromDict).to.exist;
  });
});
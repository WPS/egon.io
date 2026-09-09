import { ConfigAndDST } from 'src/app/tools/export/domain/export/configAndDst';
import { DomainStory } from 'src/app/domain/entities/domain-story';
import { IconSetExportConfiguration } from 'src/app/domain/entities/icon-set-export-configuration';

describe('ConfigAndDST', () => {
  const domainStory = [] as unknown as DomainStory;

  it('should store the icon set and the domain story', () => {
    const iconSet: IconSetExportConfiguration = {
      name: 'default',
      actors: {},
      workObjects: {},
    };

    const configAndDst = new ConfigAndDST(iconSet, domainStory);

    expect(configAndDst.iconSet).toBe(iconSet);
    expect(configAndDst.domainStory).toBe(domainStory);
  });

  it('should allow an undefined icon set', () => {
    const configAndDst = new ConfigAndDST(undefined, domainStory);

    expect(configAndDst.iconSet).toBeUndefined();
    expect(configAndDst.domainStory).toBe(domainStory);
  });
});

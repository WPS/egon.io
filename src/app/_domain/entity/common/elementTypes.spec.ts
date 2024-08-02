import { ElementTypes } from './elementTypes';

describe('getIconId()', () => {
  it('should return "Person"', () => {
    expect(ElementTypes.getIconId('domainStory:actorPerson')).toBe('Person');
  });

  it('should return "Grid"', () => {
    expect(ElementTypes.getIconId('domainStory:workObjectGrid')).toBe('Grid');
  });

  it('should return empty string', () => {
    expect(ElementTypes.getIconId('domainStory:textAnnotation')).toBe('');
  });
});

describe('isCustomType()', () => {
  it('should return true', () => {
    expect(
      ElementTypes.isCustomType('domainStory:workObjectsnacks-custom'),
    ).toBeTrue();
  });
  it('should return false', () => {
    expect(
      ElementTypes.isCustomType('domainStory:workObjectsnacks'),
    ).toBeFalse();
  });
});

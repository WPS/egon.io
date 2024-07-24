import { ElementTypes } from './elementTypes';

it('should return "Person"', () => {
  expect(ElementTypes.getIconId('domainStory:actorPerson')).toBe('Person');
});

it('should return "Grid"', () => {
  expect(ElementTypes.getIconId('domainStory:workObjectGrid')).toBe('Grid');
});

it('should return empty string', () => {
  expect(ElementTypes.getIconId('domainStory:textAnnotation')).toBe('');
});

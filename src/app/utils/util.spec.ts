import { testActivityCanvasObject } from '../domain/entities/activityCanvasObject';
import { angleBetween, degrees, positionsMatch } from './mathExtensions';
import { ElementTypes } from '../domain/entities/elementTypes';
import { sanitizeForDesktop, sanitizeIconName } from './sanitizer';
import getIconId = ElementTypes.getIconId;

describe('mathExtendsions', () => {
  beforeEach(() => {
    // polyfill for test
    if (!String.prototype.includes) {
      String.prototype.includes = function (search, start): boolean {
        'use strict';
        if (typeof start !== 'number') {
          start = 0;
        }

        if (start + search.length > this.length) {
          return false;
        } else {
          return this.indexOf(search, start) !== -1;
        }
      };
    }
  });

  describe('degrees', () => {
    it('should convert', () => {
      const rad = 0.5;
      const deg = 28.64788975654116;

      const converted = degrees(rad);

      expect(deg).toEqual(converted);
    });
  });

  describe('angleBetween', () => {
    it('', () => {
      const startPoint = {
        x: 10,
        y: 10,
      };

      const endPoint = {
        x: 20,
        y: 0,
      };

      const res = angleBetween(startPoint, endPoint);
      expect(res).toEqual(45);
    });
  });

  describe('positionsMatch', () => {
    it('should be true', () => {
      const width = 100;
      const height = 100;
      const elementX = 10;
      const elementY = 10;
      const clickX = 50;
      const clickY = 50;

      expect(
        positionsMatch(width, height, elementX, elementY, clickX, clickY),
      ).toBeTruthy();
    });

    it('should be false for x', () => {
      const width = 100;
      const height = 100;
      const elementX = 10;
      const elementY = 10;
      const clickX = 300;
      const clickY = 50;

      expect(
        positionsMatch(width, height, elementX, elementY, clickX, clickY),
      ).toBeFalsy();
    });

    it('should be false for y', () => {
      const width = 100;
      const height = 100;
      const elementX = 10;
      const elementY = 10;
      const clickX = 50;
      const clickY = 300;

      expect(
        positionsMatch(width, height, elementX, elementY, clickX, clickY),
      ).toBeFalsy();
    });
  });
});

describe('deepCopy', () => {
  it('should copy deep', () => {
    const activity = testActivityCanvasObject;
    const copy = structuredClone(activity);

    expect(copy).toEqual(activity);

    copy.id = 'testID';

    expect(copy).not.toEqual(activity);
  });
});

describe('naming', () => {
  describe('getNameForType', () => {
    it('should get type for Actor', () => {
      const testType = '_test';
      const type = ElementTypes.ACTOR + testType;

      expect(getIconId(type)).toEqual(testType);
    });
    it('should get type for WorkObject', () => {
      const testType = '_test';
      const type = ElementTypes.WORKOBJECT + testType;

      expect(getIconId(type)).toEqual(testType);
    });
    it('should get clear string for Unknown input', () => {
      const testType = '_test';
      const type = ElementTypes.DOMAINSTORY + testType;

      expect(getIconId(type)).toEqual('');
    });
  });
});

describe('sanitizer', () => {
  describe('sanitize for desktop', () => {
    it('should sanitize', () => {
      const unsanitized = '/\\:*?"><|test';
      expect(sanitizeForDesktop(unsanitized)).toEqual('test');
    });
  });

  describe('sanitize Icon Name', () => {
    it('should sanitize', () => {
      const unsanitized = '/\\:*?"<>|().-test';
      expect(sanitizeIconName(unsanitized)).toEqual('_-test');
    });
  });
});

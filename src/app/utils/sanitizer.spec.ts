import {
  sanitizeForDesktop,
  sanitizeIconName,
  sanitizeTextForSVGExport,
} from './sanitizer';

describe('sanitizer', () => {
  describe('sanitize for SVG Export', () => {
    it('should not sanitize', () => {
      const unsanitized = '-test-';
      expect(sanitizeTextForSVGExport(unsanitized)).toEqual('-test-');
    });
  });

  describe('sanitize for SVG Export', () => {
    it('should sanitize', () => {
      const unsanitized = '-test--';
      expect(sanitizeTextForSVGExport(unsanitized)).toEqual('-test––');
    });
  });

  describe('sanitize for SVG Export', () => {
    it('should sanitize multiple times', () => {
      const unsanitized = '------';
      expect(sanitizeTextForSVGExport(unsanitized)).toEqual('––––––');
    });
  });

  describe('sanitize for desktop', () => {
    it('should sanitize', () => {
      const unsanitized = '/\\:*?"><|-test--';
      expect(sanitizeForDesktop(unsanitized)).toEqual('-test––');
    });
  });

  describe('sanitize Icon Name', () => {
    it('should remove illegal characters', () => {
      const unsanitized = '/\\:*?"<>|().-test';
      expect(sanitizeIconName(unsanitized)).toEqual('');
    });

    it('should remove file ending', () => {
      const unsanitized = 'a.svg';
      expect(sanitizeIconName(unsanitized)).toEqual('a');
    });

    it('should remove whitespaces', () => {
      const unsanitized = 'a b .svg';
      expect(sanitizeIconName(unsanitized)).toEqual('a-b');
    });

    it('should not remove hyphens', () => {
      const unsanitized = 'a-b.svg';
      expect(sanitizeIconName(unsanitized)).toEqual('a-b');
    });

    it('should not remove underscores', () => {
      const unsanitized = 'a_b.svg';
      expect(sanitizeIconName(unsanitized)).toEqual('a_b');
    });

    it('should not remove dots', () => {
      const unsanitized = 'a.b.svg';
      expect(sanitizeIconName(unsanitized)).toEqual('a.b');
    });
  });
});

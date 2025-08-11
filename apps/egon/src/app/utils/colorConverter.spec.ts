import { rgbaToHex, hexToRGBA, isHexWithAlpha } from './colorConverter';

describe('colorConverter Test', () => {
  describe('rgbaToHex Test', () => {
    it('case1', () => {
      expect(rgbaToHex('rgba(0, 136, 255, 1)')).toEqual('#0088ffff');
    });

    it('case2', () => {
      expect(rgbaToHex('rgba(0, 136, 255, 0.53125)')).toEqual('#0088ff87');
    });

    it('case3', () => {
      expect(rgbaToHex('rgba(255, 15, 15, 1)')).toEqual('#ff0f0fff');
    });

    it('was already hex', () => {
      expect(rgbaToHex('#0fff00ff')).toEqual('#0fff00ff');
    });
  });

  describe('hexToRGBA Test', () => {
    it('case1', () => {
      expect(hexToRGBA('#0088ffff')).toEqual('rgba(0,136,255,1)');
    });

    it('rundet auf 2 Nachkommastellen', () => {
      expect(hexToRGBA('#0088ff87')).toEqual('rgba(0,136,255,0.53)');
    });

    it('case3', () => {
      expect(hexToRGBA('#ff0f0fff')).toEqual('rgba(255,15,15,1)');
    });

    it('3 Zeichen', () => {
      expect(hexToRGBA('#f80')).toEqual('rgba(255,136,0,1)');
    });

    it('4 Zeichen', () => {
      expect(hexToRGBA('#f808')).toEqual('rgba(255,136,0,0.53)');
    });

    it('6 Zeichen', () => {
      expect(hexToRGBA('#0088ff')).toEqual('rgba(0,136,255,1)');
    });

    it('nur eine Nachkommastelle', () => {
      expect(hexToRGBA('#0088ff80')).toEqual('rgba(0,136,255,0.5)');
    });
  });

  describe('isHexWithAlpha', () => {
    it('short hex', () => {
      expect(isHexWithAlpha('#fff')).toBeFalse();
      expect(isHexWithAlpha('#fffa')).toBeTrue();
    });

    it('hex', () => {
      expect(isHexWithAlpha('#ff00ff')).toBeFalse();
      expect(isHexWithAlpha('#ff0f0fff')).toBeTrue();
    });
  });
});

import { calculateWidthAndHeight } from '../../../app/domain-story-modeler/features/export/pngDownload';

describe('pngDownload', function() {

  it('calculateWidthAndHeight1 xLeft<0, xRight<0, yUp<0, yDown<0', function() {
    var xLeft = - 10,
        xRight = - 2,
        yUp = -30,
        yDown = -3;

    var controllwidth = 308,
        controllheight = 327;

    var [height, width] = calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

    assert.equal(controllheight, height);
    assert.equal(controllwidth, width);
  });

  it('calculateWidthAndHeight2 xLeft<0, xRight<0, yUp<0, yDown<0', function() {
    var xLeft = - 305,
        xRight = - 2,
        yUp = -306,
        yDown = -2;

    var controllwidth = 303,
        controllheight = 304;

    var [height, width] = calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

    assert.equal(controllheight, height);
    assert.equal(controllwidth, width);
  });

  it('calculateWidthAndHeight3 xLeft<0, xRight>0, yUp<0, yDown>0', function() {
    var xLeft = -10,
        xRight = 2,
        yUp = -30,
        yDown = 3;

    var controllwidth = 312,
        controllheight = 333;

    var [height, width] = calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

    assert.equal(controllheight, height);
    assert.equal(controllwidth, width);
  });

  it('calculateWidthAndHeight4 xLeft<0, xRight>0, yUp<0, yDown>0', function() {
    var xLeft = -300,
        xRight = 2,
        yUp = -330,
        yDown = 3;

    var controllwidth = 302,
        controllheight = 333;

    var [height, width] = calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

    assert.equal(controllheight, height);
    assert.equal(controllwidth, width);
  });

  it('calculateWidthAndHeight5 xLeft>0, xRight>0, yUp>0, yDown>0 all<300', function() {
    var xLeft = 2,
        xRight = 10,
        yUp = 3,
        yDown = 50;

    var controllwidth = 308,
        controllheight = 347;

    var [height, width] = calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

    assert.equal(controllheight, height);
    assert.equal(controllwidth, width);
  });

  it('calculateWidthAndHeight6 xLeft>0, xRight>0, yUp>0, yDown>0 all<300', function() {
    var xLeft = 2,
        xRight = 320,
        yUp = 3,
        yDown = 360;

    var controllwidth = 318,
        controllheight = 357;

    var [height, width] = calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

    assert.equal(controllheight, height);
    assert.equal(controllwidth, width);
  });
});
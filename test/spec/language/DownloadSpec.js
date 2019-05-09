import { calculateWidthAndHeight } from '../../../app/domain-story-modeler/features/export/pngDownload';

describe('pngDownload', function() {

  it('calculateWidthAndHeight1 xLeft<0, xRight<0, yUp<0, yDown<0', function() {
    const xLeft = - 10,
          xRight = - 2,
          yUp = -30,
          yDown = -3;

    const controllwidth = 308,
          controllheight = 327;

    const [height, width] = calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

    assert.equal(controllheight, height);
    assert.equal(controllwidth, width);
  });

  it('calculateWidthAndHeight2 xLeft<0, xRight<0, yUp<0, yDown<0', function() {
    const xLeft = - 305,
          xRight = - 2,
          yUp = -306,
          yDown = -2;

    const controllwidth = 303,
          controllheight = 304;

    const [height, width] = calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

    assert.equal(controllheight, height);
    assert.equal(controllwidth, width);
  });

  it('calculateWidthAndHeight3 xLeft<0, xRight>0, yUp<0, yDown>0', function() {
    const xLeft = -10,
          xRight = 2,
          yUp = -30,
          yDown = 3;

    const controllwidth = 312,
          controllheight = 333;

    const [height, width] = calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

    assert.equal(controllheight, height);
    assert.equal(controllwidth, width);
  });

  it('calculateWidthAndHeight4 xLeft<0, xRight>0, yUp<0, yDown>0', function() {
    const xLeft = -300,
          xRight = 2,
          yUp = -330,
          yDown = 3;

    const controllwidth = 302,
          controllheight = 333;

    const [height, width] = calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

    assert.equal(controllheight, height);
    assert.equal(controllwidth, width);
  });

  it('calculateWidthAndHeight5 xLeft>0, xRight>0, yUp>0, yDown>0 all<300', function() {
    const xLeft = 2,
          xRight = 10,
          yUp = 3,
          yDown = 50;

    const controllwidth = 308,
          controllheight = 347;

    const [height, width] = calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

    assert.equal(controllheight, height);
    assert.equal(controllwidth, width);
  });

  it('calculateWidthAndHeight6 xLeft>0, xRight>0, yUp>0, yDown>0 all<300', function() {
    const xLeft = 2,
          xRight = 320,
          yUp = 3,
          yDown = 360;

    const controllwidth = 318,
          controllheight = 357;

    const [height, width] = calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

    assert.equal(controllheight, height);
    assert.equal(controllwidth, width);
  });
});
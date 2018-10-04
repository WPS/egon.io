import DomainStoryIdFactory from '../../../app/domain-story-modeler/util/DomainStoryIdFactory';

describe('DomainStoryIdFactory', function() {

  it('generateId', function() {
    var idFactory = new DomainStoryIdFactory();
    var res = idFactory.getId('shape');
    assert.notDeepEqual(res, 'shape_0001');
  });

  it('generateId equal length', function() {
    var idFactory = new DomainStoryIdFactory();
    var res = idFactory.getId('shape');
    var otherId = 'shape_0001';
    assert.deepEqual(res.length, otherId.length);
  });

  it('generateId short length 001', function() {
    var idFactory = new DomainStoryIdFactory();
    var res = idFactory.getId('shape');
    var otherId = 'shape_001';
    assert.notDeepEqual(res.length, otherId.length);
  });

  it('generateId long length 00001', function() {
    var idFactory = new DomainStoryIdFactory();
    var res = idFactory.getId('shape');
    var otherId = 'shape_00001';
    assert.notDeepEqual(res.length, otherId.length);
  });
});
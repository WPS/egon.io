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

  it('generateId unique iD amount 5k', function() {
    this.timeout(0);
    var idFactory = new DomainStoryIdFactory();
    var res = [];
    for (var i=0; i<5000;i++) {
      res[i] =idFactory.getId('');
    }

    for (i=0; i<res.length-1;i++) {
      for (var j=i+1; j<res.length;j++) {
        assert.notEqual(res[i], res[j]);
      }
    }
  });
});
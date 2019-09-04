import DomainStoryIdFactory from '../../../app/domain-story-modeler/modeler/DomainStoryIdFactory';

describe('DomainStoryIdFactory', function() {

  it('generateId', function() {
    const idFactory = new DomainStoryIdFactory();
    const res = idFactory.getId('shape');
    assert.notDeepEqual(res, 'shape_0001');
  });

  it('generateId equal length', function() {
    const idFactory = new DomainStoryIdFactory();
    const res = idFactory.getId('shape');
    const otherId = 'shape_0001';
    assert.deepEqual(res.length, otherId.length);
  });

  it('generateId short length 001', function() {
    const idFactory = new DomainStoryIdFactory();
    const res = idFactory.getId('shape');
    const otherId = 'shape_001';
    assert.notDeepEqual(res.length, otherId.length);
  });

  it('generateId long length 00001', function() {
    const idFactory = new DomainStoryIdFactory();
    const res = idFactory.getId('shape');
    const otherId = 'shape_00001';
    assert.notDeepEqual(res.length, otherId.length);
  });

  it('generateId unique iD amount 5k', function() {
    this.timeout(0);
    const idFactory = new DomainStoryIdFactory();
    const res = [];
    for (let i=0; i<5000;i++) {
      res[i] =idFactory.getId('');
    }

    for (let i=0; i<res.length-1;i++) {
      for (let j=i+1; j<res.length;j++) {
        assert.notEqual(res[i], res[j]);
      }
    }
  });
});
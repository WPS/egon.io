import DomainStoryIdFactory from '../features/domainStoryIdFactory';

describe('DomainStoryIdFactory', function () {
  it('generateId', function () {
    const idFactory = new DomainStoryIdFactory();
    const res = idFactory.getId('shape');
    expect(res).not.toEqual('shape_0001');
  });

  it('generateId equal length', function () {
    const idFactory = new DomainStoryIdFactory();
    const res = idFactory.getId('shape');
    const otherId = 'shape_0001';
    expect(res.length).toEqual(otherId.length);
  });

  it('generateId short length 001', function () {
    const idFactory = new DomainStoryIdFactory();
    const res = idFactory.getId('shape');
    const otherId = 'shape_001';
    expect(res.length).not.toEqual(otherId.length);
  });

  it('generateId long length 00001', function () {
    const idFactory = new DomainStoryIdFactory();
    const res = idFactory.getId('shape');
    const otherId = 'shape_00001';
    expect(res.length).not.toEqual(otherId.length);
  });

  it('generateId unique iD amount 5k', function () {
    const idFactory = new DomainStoryIdFactory();
    const resultSet = new Set();
    for (let i = 0; i < 5000; i++) {
      resultSet.add(idFactory.getId(''));
    }
    // we are sure all ids are unique because the set doesnt allow duplicates
    expect(resultSet.size).toEqual(5000);
  });
});
